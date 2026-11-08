package com.ps10000.tv.server;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.*;

/**
 * PS10,000 embedded server. Plain JDK only (runs on Android and desktop).
 *  - Static files from a ContentSource (APK assets or a folder)
 *  - ROM files from a writable folder (/roms/...), listing + upload from phones
 *  - WebSocket relay at /ws : phones (role=pad) <-> TV page (role=tv)
 */
public class WebServer {

    public interface ContentSource {
        /** Returns null when missing. */
        InputStream open(String path) throws IOException;
        /** -1 when unknown. */
        long length(String path);
    }

    public interface Host {
        /** LAN IPv4 shown in the QR code, or null. */
        String lanIp();
        void log(String msg);
    }

    private static final int MAX_UPLOAD = 96 * 1024 * 1024;
    private static final Set<String> ROM_EXT = new HashSet<>(Arrays.asList(
            "nes", "sfc", "smc", "gb", "gbc", "gba", "md", "gen", "smd", "bin", "sms", "gg", "zip"));

    private final int port;
    private final ContentSource content;
    private final File romDir;
    private final Host host;
    private final String key;
    private ServerSocket serverSocket;
    private final ExecutorService pool = Executors.newCachedThreadPool(new ThreadFactory() {
        @Override public Thread newThread(Runnable r) { Thread t = new Thread(r, "ps10k-http"); t.setDaemon(true); return t; }
    });
    private volatile boolean running;

    // WebSocket relay state
    private final Set<WsConn> tvs = new CopyOnWriteArraySet<>();
    private final Map<Integer, WsConn> pads = new ConcurrentHashMap<>();
    private int nextPadId = 1;

    public WebServer(int port, ContentSource content, File romDir, Host host) {
        this.port = port;
        this.content = content;
        this.romDir = romDir;
        this.host = host;
        byte[] b = new byte[3];
        new SecureRandom().nextBytes(b);
        this.key = String.format(Locale.US, "%06d", ((b[0] & 0xff) << 16 | (b[1] & 0xff) << 8 | (b[2] & 0xff)) % 1000000);
        if (romDir != null) romDir.mkdirs();
    }

    public String key() { return key; }
    public int port() { return serverSocket != null ? serverSocket.getLocalPort() : port; }

    public synchronized void start() throws IOException {
        if (running) return;
        IOException last = null;
        for (int p = port; p < port + 10; p++) {
            try {
                ServerSocket s = new ServerSocket();
                s.setReuseAddress(true);
                s.bind(new InetSocketAddress(p));
                serverSocket = s;
                last = null;
                break;
            } catch (IOException e) { last = e; }
        }
        if (last != null) throw last;
        running = true;
        Thread t = new Thread(this::acceptLoop, "ps10k-accept");
        t.setDaemon(true);
        t.start();
        host.log("server on port " + port() + " key " + key);
    }

    public synchronized void stop() {
        running = false;
        try { if (serverSocket != null) serverSocket.close(); } catch (IOException ignored) {}
        for (WsConn c : tvs) c.close();
        for (WsConn c : pads.values()) c.close();
        pool.shutdownNow();
    }

    private void acceptLoop() {
        while (running) {
            try {
                Socket s = serverSocket.accept();
                pool.execute(() -> handle(s));
            } catch (IOException e) {
                if (running) host.log("accept: " + e);
            }
        }
    }

    // ---------------------------------------------------------------- HTTP

    private static final class Req {
        String method, path, query = "";
        final Map<String, String> headers = new HashMap<>();
        Map<String, String> params() {
            Map<String, String> m = new HashMap<>();
            for (String kv : query.split("&")) {
                if (kv.isEmpty()) continue;
                int i = kv.indexOf('=');
                try {
                    String k = URLDecoder.decode(i < 0 ? kv : kv.substring(0, i), "UTF-8");
                    String v = i < 0 ? "" : URLDecoder.decode(kv.substring(i + 1), "UTF-8");
                    m.put(k, v);
                } catch (UnsupportedEncodingException ignored) {}
            }
            return m;
        }
    }

    private void handle(Socket s) {
        try {
            s.setTcpNoDelay(true);
            s.setSoTimeout(15000);
            InputStream in = new BufferedInputStream(s.getInputStream(), 16384);
            OutputStream out = new BufferedOutputStream(s.getOutputStream(), 65536);
            while (running) {
                Req r = readRequest(in);
                if (r == null) break;
                boolean local = s.getInetAddress().isLoopbackAddress();
                if ("websocket".equalsIgnoreCase(r.headers.get("upgrade"))) {
                    s.setSoTimeout(0);
                    websocket(s, in, out, r, local);
                    return; // socket owned by ws
                }
                boolean keep = route(r, in, out, local);
                out.flush();
                if (!keep || "close".equalsIgnoreCase(r.headers.get("connection"))) break;
            }
        } catch (IOException ignored) {
        } finally {
            if (!s.isClosed() && !wsOwned.contains(s)) try { s.close(); } catch (IOException ignored) {}
        }
    }

    private final Set<Socket> wsOwned = Collections.newSetFromMap(new ConcurrentHashMap<Socket, Boolean>());

    private static String readLine(InputStream in) throws IOException {
        StringBuilder sb = new StringBuilder();
        int c;
        while ((c = in.read()) != -1) {
            if (c == '\n') break;
            if (c != '\r') sb.append((char) c);
            if (sb.length() > 8192) throw new IOException("line too long");
        }
        if (c == -1 && sb.length() == 0) return null;
        return sb.toString();
    }

    private static Req readRequest(InputStream in) throws IOException {
        String line;
        try { line = readLine(in); } catch (SocketTimeoutException e) { return null; }
        if (line == null || line.isEmpty()) return null;
        String[] parts = line.split(" ");
        if (parts.length < 2) return null;
        Req r = new Req();
        r.method = parts[0].toUpperCase(Locale.US);
        String target = parts[1];
        int q = target.indexOf('?');
        r.path = q < 0 ? target : target.substring(0, q);
        if (q >= 0) r.query = target.substring(q + 1);
        try { r.path = URLDecoder.decode(r.path.replace("+", "%2B"), "UTF-8"); } catch (Exception ignored) {}
        String h;
        while ((h = readLine(in)) != null && !h.isEmpty()) {
            int i = h.indexOf(':');
            if (i > 0) r.headers.put(h.substring(0, i).trim().toLowerCase(Locale.US), h.substring(i + 1).trim());
        }
        return r;
    }

    private boolean route(Req r, InputStream in, OutputStream out, boolean local) throws IOException {
        String p = r.path;
        if (p.startsWith("/api/")) return api(r, in, out, local);
        if (!"GET".equals(r.method) && !"HEAD".equals(r.method)) {
            send(out, 405, "text/plain", "method not allowed".getBytes(StandardCharsets.UTF_8), r);
            return true;
        }
        if (p.contains("..") || p.contains("\\")) { send(out, 400, "text/plain", "bad path".getBytes(StandardCharsets.UTF_8), r); return true; }
        if (p.equals("/")) p = "/index.html";
        if (p.endsWith("/")) p = p + "index.html";
        if (p.equals("/pad") ) { redirect(out, "/pad/" + (r.query.isEmpty() ? "" : "?" + r.query)); return true; }

        if (p.startsWith("/roms/") && romDir != null) {
            File f = new File(romDir, p.substring(6));
            if (!f.getCanonicalPath().startsWith(romDir.getCanonicalPath()) || !f.isFile()) {
                send(out, 404, "text/plain", "not found".getBytes(StandardCharsets.UTF_8), r);
                return true;
            }
            try (InputStream fi = new FileInputStream(f)) { stream(out, 200, mime(p), fi, f.length(), r); }
            return true;
        }
        String rel = p.substring(1);
        InputStream is = content.open(rel);
        if (is == null) { send(out, 404, "text/plain", ("not found: " + p).getBytes(StandardCharsets.UTF_8), r); return true; }
        try { stream(out, 200, mime(p), is, content.length(rel), r); } finally { is.close(); }
        return true;
    }

    private boolean api(Req r, InputStream in, OutputStream out, boolean local) throws IOException {
        Map<String, String> q = r.params();
        boolean authed = local || key.equals(q.get("k"));
        switch (r.path) {
            case "/api/info": {
                String ip = host.lanIp();
                String json = "{\"ip\":" + jstr(ip) + ",\"port\":" + port() + (local ? ",\"key\":" + jstr(key) : "") + ",\"pads\":" + pads.size() + "}";
                send(out, 200, "application/json", json.getBytes(StandardCharsets.UTF_8), r);
                return true;
            }
            case "/api/roms": {
                StringBuilder sb = new StringBuilder("[");
                File[] fs = romDir == null ? null : romDir.listFiles();
                if (fs != null) {
                    Arrays.sort(fs, new Comparator<File>() { @Override public int compare(File a, File b) { return a.getName().compareToIgnoreCase(b.getName()); } });
                    boolean first = true;
                    for (File f : fs) {
                        if (!f.isFile() || !ROM_EXT.contains(ext(f.getName()))) continue;
                        if (!first) sb.append(',');
                        first = false;
                        sb.append("{\"name\":").append(jstr(f.getName())).append(",\"size\":").append(f.length())
                          .append(",\"mtime\":").append(f.lastModified()).append('}');
                    }
                }
                sb.append(']');
                send(out, 200, "application/json", sb.toString().getBytes(StandardCharsets.UTF_8), r);
                return true;
            }
            case "/api/upload": {
                if (!"POST".equals(r.method) || !authed) { drain(in, r); send(out, 403, "text/plain", "forbidden".getBytes(StandardCharsets.UTF_8), r); return false; }
                String name = sanitize(q.get("name"));
                long len = parseLong(r.headers.get("content-length"));
                if (name == null || !ROM_EXT.contains(ext(name)) || len <= 0 || len > MAX_UPLOAD) {
                    drain(in, r);
                    send(out, 400, "application/json", "{\"ok\":false,\"error\":\"bad file\"}".getBytes(StandardCharsets.UTF_8), r);
                    return false;
                }
                File tmp = new File(romDir, "." + name + ".part");
                try (OutputStream fo = new BufferedOutputStream(new FileOutputStream(tmp))) {
                    byte[] buf = new byte[65536];
                    long left = len;
                    while (left > 0) {
                        int n = in.read(buf, 0, (int) Math.min(buf.length, left));
                        if (n < 0) throw new EOFException();
                        fo.write(buf, 0, n);
                        left -= n;
                    }
                }
                File dst = new File(romDir, name);
                if (dst.exists()) dst.delete();
                if (!tmp.renameTo(dst)) throw new IOException("rename failed");
                host.log("uploaded " + name + " " + len);
                broadcastTv("{\"t\":\"roms\"}");
                send(out, 200, "application/json", ("{\"ok\":true,\"name\":" + jstr(name) + "}").getBytes(StandardCharsets.UTF_8), r);
                return true;
            }
            case "/api/delete": {
                if (!local) { send(out, 403, "text/plain", "forbidden".getBytes(StandardCharsets.UTF_8), r); return true; }
                String name = sanitize(q.get("name"));
                boolean ok = name != null && new File(romDir, name).delete();
                if (ok) broadcastTv("{\"t\":\"roms\"}");
                send(out, 200, "application/json", ("{\"ok\":" + ok + "}").getBytes(StandardCharsets.UTF_8), r);
                return true;
            }
            default:
                drain(in, r);
                send(out, 404, "text/plain", "no api".getBytes(StandardCharsets.UTF_8), r);
                return true;
        }
    }

    private static void drain(InputStream in, Req r) throws IOException {
        long len = parseLong(r.headers.get("content-length"));
        if (len > 0 && len < 1 << 20) { long skipped = 0; while (skipped < len) { long n = in.skip(len - skipped); if (n <= 0) break; skipped += n; } }
    }

    private static String or(String a, String b) { return a == null ? b : a; }

    private static long parseLong(String s) { try { return s == null ? -1 : Long.parseLong(s.trim()); } catch (NumberFormatException e) { return -1; } }

    static String sanitize(String name) {
        if (name == null) return null;
        name = name.replace('\\', '/');
        name = name.substring(name.lastIndexOf('/') + 1).replaceAll("[^A-Za-z0-9 ._()\\-\\[\\]!&',+]", "_").trim();
        if (name.isEmpty() || name.startsWith(".") || name.length() > 120) return null;
        return name;
    }

    private static String ext(String n) { int i = n.lastIndexOf('.'); return i < 0 ? "" : n.substring(i + 1).toLowerCase(Locale.US); }

    static String jstr(String s) {
        if (s == null) return "null";
        StringBuilder sb = new StringBuilder("\"");
        for (char c : s.toCharArray()) {
            if (c == '"' || c == '\\') sb.append('\\').append(c);
            else if (c < 0x20) sb.append(String.format(Locale.US, "\\u%04x", (int) c));
            else sb.append(c);
        }
        return sb.append('"').toString();
    }

    private static void redirect(OutputStream out, String loc) throws IOException {
        String h = "HTTP/1.1 302 Found\r\nLocation: " + loc + "\r\nContent-Length: 0\r\n\r\n";
        out.write(h.getBytes(StandardCharsets.ISO_8859_1));
    }

    private static void send(OutputStream out, int code, String type, byte[] body, Req r) throws IOException {
        stream(out, code, type, new ByteArrayInputStream(body), body.length, r);
    }

    private static void stream(OutputStream out, int code, String type, InputStream body, long len, Req r) throws IOException {
        byte[] data = null;
        if (len < 0) { data = readAll(body); len = data.length; }
        StringBuilder h = new StringBuilder();
        h.append("HTTP/1.1 ").append(code).append(code == 200 ? " OK" : code == 404 ? " Not Found" : " Status").append("\r\n");
        h.append("Content-Type: ").append(type).append("\r\n");
        h.append("Content-Length: ").append(len).append("\r\n");
        h.append("Cache-Control: no-cache\r\n");
        h.append("Access-Control-Allow-Origin: *\r\n");
        h.append("Connection: keep-alive\r\n\r\n");
        out.write(h.toString().getBytes(StandardCharsets.ISO_8859_1));
        if ("HEAD".equals(r.method)) return;
        if (data != null) { out.write(data); return; }
        byte[] buf = new byte[65536];
        long left = len;
        int n;
        while (left > 0 && (n = body.read(buf, 0, (int) Math.min(buf.length, left))) > 0) { out.write(buf, 0, n); left -= n; }
    }

    private static byte[] readAll(InputStream in) throws IOException {
        ByteArrayOutputStream bo = new ByteArrayOutputStream();
        byte[] buf = new byte[65536];
        int n;
        while ((n = in.read(buf)) > 0) bo.write(buf, 0, n);
        return bo.toByteArray();
    }

    static String mime(String p) {
        switch (ext(p)) {
            case "html": case "htm": return "text/html; charset=utf-8";
            case "js": case "mjs": return "application/javascript; charset=utf-8";
            case "css": return "text/css; charset=utf-8";
            case "json": return "application/json; charset=utf-8";
            case "png": return "image/png";
            case "jpg": case "jpeg": return "image/jpeg";
            case "gif": return "image/gif";
            case "webp": return "image/webp";
            case "svg": return "image/svg+xml";
            case "ico": return "image/x-icon";
            case "woff": return "font/woff";
            case "woff2": return "font/woff2";
            case "ttf": return "font/ttf";
            case "wasm": return "application/wasm";
            case "mp3": return "audio/mpeg";
            case "ogg": return "audio/ogg";
            case "wav": return "audio/wav";
            case "xm": case "mod": case "data": case "bin": case "nes": case "gb": case "gbc": case "gba": case "sfc": case "smc":
            case "md": case "gen": case "smd": case "sms": case "gg": case "zip":
                return "application/octet-stream";
            case "txt": case "md5": return "text/plain; charset=utf-8";
            case "mp4": return "video/mp4";
            default: return "application/octet-stream";
        }
    }

    // ----------------------------------------------------------- WebSocket

    private void websocket(Socket s, InputStream in, OutputStream out, Req r, boolean local) throws IOException {
        Map<String, String> q = r.params();
        String role = q.containsKey("role") ? q.get("role") : "pad";
        if ("tv".equals(role) && !local) { s.close(); return; }
        if ("pad".equals(role) && !local && !key.equals(q.get("k"))) {
            out.write("HTTP/1.1 403 Forbidden\r\nContent-Length: 0\r\n\r\n".getBytes(StandardCharsets.ISO_8859_1));
            out.flush();
            s.close();
            return;
        }
        String wsKey = r.headers.get("sec-websocket-key");
        if (wsKey == null) { s.close(); return; }
        String accept;
        try {
            MessageDigest sha = MessageDigest.getInstance("SHA-1");
            accept = base64(sha.digest((wsKey + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").getBytes(StandardCharsets.ISO_8859_1)));
        } catch (Exception e) { throw new IOException(e); }
        out.write(("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: " + accept + "\r\n\r\n").getBytes(StandardCharsets.ISO_8859_1));
        out.flush();
        wsOwned.add(s);
        WsConn c = new WsConn(s, in, out);
        try {
            if ("tv".equals(role)) runTv(c); else runPad(c, q);
        } finally {
            wsOwned.remove(s);
            c.close();
        }
    }

    private void runTv(WsConn c) {
        tvs.add(c);
        // tell this TV about pads already connected
        for (Map.Entry<Integer, WsConn> e : pads.entrySet()) c.sendText(e.getValue().joinMsg);
        try {
            while (true) {
                WsConn.Frame f = c.read();
                if (f == null) break;
                if (f.op == 1) {
                    String txt = new String(f.data, StandardCharsets.UTF_8);
                    // routing: {"to":N,...} or {"to":"all",...}
                    int to = parseTo(txt);
                    if (to == -1) { for (WsConn p : pads.values()) p.sendText(txt); }
                    else if (to > 0) { WsConn p = pads.get(to); if (p != null) p.sendText(txt); }
                } else if (f.op == 2 && f.data.length > 1) {
                    WsConn p = pads.get(f.data[0] & 0xff);
                    if (p != null) p.sendBinary(Arrays.copyOfRange(f.data, 1, f.data.length));
                }
            }
        } catch (IOException ignored) {
        } finally { tvs.remove(c); }
    }

    static int parseTo(String txt) {
        int i = txt.indexOf("\"to\":");
        if (i < 0) return 0;
        i += 5;
        while (i < txt.length() && txt.charAt(i) == ' ') i++;
        if (txt.startsWith("\"all\"", i)) return -1;
        int j = i;
        while (j < txt.length() && Character.isDigit(txt.charAt(j))) j++;
        try { return Integer.parseInt(txt.substring(i, j)); } catch (NumberFormatException e) { return 0; }
    }

    private int allocPadId() {
        synchronized (pads) {
            for (int tries = 0; tries < 255; tries++) {
                int id = nextPadId;
                nextPadId = nextPadId % 255 + 1;
                if (!pads.containsKey(id)) return id;
            }
            return -1;
        }
    }

    private void runPad(WsConn c, Map<String, String> q) {
        int id = allocPadId();
        if (id < 0) return;
        c.padId = id;
        c.joinMsg = "{\"t\":\"join\",\"cid\":" + id + ",\"pid\":" + jstr(or(q.get("pid"), "")) + ",\"name\":" + jstr(or(q.get("name"), "Phone")) + ",\"ua\":" + jstr(or(q.get("ua"), "")) + "}";
        pads.put(id, c);
        broadcastTv(c.joinMsg);
        c.sendText("{\"t\":\"hello\",\"cid\":" + id + "}");
        try {
            while (true) {
                WsConn.Frame f = c.read();
                if (f == null) break;
                if (f.op == 2) {
                    byte[] msg = new byte[f.data.length + 1];
                    msg[0] = (byte) id;
                    System.arraycopy(f.data, 0, msg, 1, f.data.length);
                    for (WsConn tv : tvs) tv.sendBinary(msg);
                } else if (f.op == 1) {
                    String txt = new String(f.data, StandardCharsets.UTF_8);
                    String wrapped = "{\"t\":\"msg\",\"cid\":" + id + ",\"msg\":" + txt + "}";
                    for (WsConn tv : tvs) tv.sendText(wrapped);
                }
            }
        } catch (IOException ignored) {
        } finally {
            pads.remove(id);
            broadcastTv("{\"t\":\"leave\",\"cid\":" + id + "}");
        }
    }

    private void broadcastTv(String msg) { for (WsConn tv : tvs) tv.sendText(msg); }

    private static String base64(byte[] b) {
        final String A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < b.length; i += 3) {
            int n = (b[i] & 0xff) << 16 | (i + 1 < b.length ? (b[i + 1] & 0xff) << 8 : 0) | (i + 2 < b.length ? (b[i + 2] & 0xff) : 0);
            sb.append(A.charAt(n >> 18 & 63)).append(A.charAt(n >> 12 & 63));
            sb.append(i + 1 < b.length ? A.charAt(n >> 6 & 63) : '=');
            sb.append(i + 2 < b.length ? A.charAt(n & 63) : '=');
        }
        return sb.toString();
    }

    /** One WebSocket connection. Writes are synchronized; reads on the owning thread. */
    static final class WsConn {
        static final class Frame { int op; byte[] data; }
        final Socket socket; final InputStream in; final OutputStream out;
        int padId; String joinMsg;
        private volatile boolean closed;
        private ByteArrayOutputStream frag; private int fragOp;

        WsConn(Socket s, InputStream in, OutputStream out) {
            this.socket = s; this.in = in; this.out = out;
            try { s.setTcpNoDelay(true); } catch (SocketException ignored) {}
        }

        Frame read() throws IOException {
            while (true) {
                int b0 = in.read();
                if (b0 < 0) return null;
                int b1 = in.read();
                if (b1 < 0) return null;
                boolean fin = (b0 & 0x80) != 0;
                int op = b0 & 0x0f;
                boolean masked = (b1 & 0x80) != 0;
                long len = b1 & 0x7f;
                if (len == 126) len = (readByte() << 8) | readByte();
                else if (len == 127) { len = 0; for (int i = 0; i < 8; i++) len = (len << 8) | readByte(); }
                if (len > (8 << 20)) throw new IOException("frame too big");
                byte[] mask = new byte[4];
                if (masked) readFully(mask);
                byte[] data = new byte[(int) len];
                readFully(data);
                if (masked) for (int i = 0; i < data.length; i++) data[i] ^= mask[i & 3];
                if (op == 8) { close(); return null; }
                if (op == 9) { write(10, data); continue; }
                if (op == 10) continue;
                if (op == 0) {
                    if (frag == null) continue;
                    frag.write(data);
                    if (!fin) continue;
                    Frame f = new Frame(); f.op = fragOp; f.data = frag.toByteArray(); frag = null;
                    return f;
                }
                if (!fin) { frag = new ByteArrayOutputStream(); frag.write(data); fragOp = op; continue; }
                Frame f = new Frame(); f.op = op; f.data = data;
                return f;
            }
        }

        private int readByte() throws IOException { int b = in.read(); if (b < 0) throw new EOFException(); return b; }
        private void readFully(byte[] b) throws IOException {
            int o = 0;
            while (o < b.length) { int n = in.read(b, o, b.length - o); if (n < 0) throw new EOFException(); o += n; }
        }

        void sendText(String s) { write(1, s.getBytes(StandardCharsets.UTF_8)); }
        void sendBinary(byte[] b) { write(2, b); }

        synchronized void write(int op, byte[] data) {
            if (closed) return;
            try {
                int len = data.length;
                if (len < 126) { out.write(0x80 | op); out.write(len); }
                else if (len < 65536) { out.write(0x80 | op); out.write(126); out.write(len >> 8); out.write(len & 0xff); }
                else { out.write(0x80 | op); out.write(127); for (int i = 7; i >= 0; i--) out.write((int) ((long) len >> (8 * i)) & 0xff); }
                out.write(data);
                out.flush();
            } catch (IOException e) { close(); }
        }

        void close() {
            if (closed) return;
            closed = true;
            try { socket.close(); } catch (IOException ignored) {}
        }
    }
}
