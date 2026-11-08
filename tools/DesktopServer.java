import com.ps10000.tv.server.WebServer;
import java.io.*;
import java.net.*;
import java.util.*;

/** Desktop runner for testing the PS10,000 server: java DesktopServer <webroot> <romdir> [port] */
public class DesktopServer {
    public static void main(String[] a) throws Exception {
        File root = new File(a[0]);
        File roms = new File(a[1]);
        int port = a.length > 2 ? Integer.parseInt(a[2]) : 8080;
        WebServer.ContentSource src = new WebServer.ContentSource() {
            public InputStream open(String p) throws IOException { File f = new File(root, p); return f.isFile() ? new FileInputStream(f) : null; }
            public long length(String p) { File f = new File(root, p); return f.isFile() ? f.length() : -1; }
        };
        WebServer s = new WebServer(port, src, roms, new WebServer.Host() {
            public String lanIp() {
                try {
                    for (NetworkInterface ni : Collections.list(NetworkInterface.getNetworkInterfaces()))
                        for (InetAddress ad : Collections.list(ni.getInetAddresses()))
                            if (ad instanceof Inet4Address && !ad.isLoopbackAddress()) return ad.getHostAddress();
                } catch (Exception ignored) {}
                return "127.0.0.1";
            }
            public void log(String m) { System.out.println("[ps10k] " + m); }
        });
        s.start();
        Thread.currentThread().join();
    }
}
