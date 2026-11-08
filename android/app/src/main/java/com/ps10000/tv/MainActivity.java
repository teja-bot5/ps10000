package com.ps10000.tv;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;
import android.content.res.AssetManager;
import android.graphics.Color;
import android.hardware.input.InputManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;
import android.util.SparseArray;
import android.view.InputDevice;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import com.ps10000.tv.server.WebServer;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Collections;
import java.util.Locale;

public class MainActivity extends Activity implements InputManager.InputDeviceListener {
    private static final String TAG = "PS10000";
    private static final int PORT = 8080;

    private FrameLayout root;
    private WebView web;
    private WebServer server;
    private File romDir;
    private InputManager inputManager;
    private final Handler main = new Handler(Looper.getMainLooper());

    /** Native controller state, one entry per Android input device id. */
    private static final class Pad {
        int mask; float lx, ly, rx, ry, lt, rt; int hatMask; String name; String lastSent = "";
    }
    private final SparseArray<Pad> pads = new SparseArray<>();

    // ------------------------------------------------------------------ lifecycle

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | WindowManager.LayoutParams.FLAG_FULLSCREEN);
        root = new FrameLayout(this);
        root.setBackgroundColor(Color.BLACK);
        setContentView(root);
        hideSystemUi();

        File ext = getExternalFilesDir("roms");
        romDir = ext != null ? ext : new File(getFilesDir(), "roms");
        romDir.mkdirs();

        startServer();
        createWebView();

        inputManager = (InputManager) getSystemService(Context.INPUT_SERVICE);
        if (inputManager != null) inputManager.registerInputDeviceListener(this, main);
    }

    private void startServer() {
        final AssetManager assets = getAssets();
        WebServer.ContentSource src = new WebServer.ContentSource() {
            @Override public InputStream open(String path) {
                try { return assets.open("web/" + path, AssetManager.ACCESS_STREAMING); } catch (IOException e) { return null; }
            }
            @Override public long length(String path) {
                try (android.content.res.AssetFileDescriptor fd = assets.openFd("web/" + path)) { return fd.getLength(); }
                catch (IOException e) { return -1; } // compressed asset: server reads it fully
            }
        };
        server = new WebServer(PORT, src, romDir, new WebServer.Host() {
            @Override public String lanIp() { return findLanIp(); }
            @Override public void log(String msg) { Log.i(TAG, msg); }
        });
        try { server.start(); } catch (IOException e) { Log.e(TAG, "server failed", e); }
    }

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    private void createWebView() {
        if (web != null) { root.removeView(web); web.destroy(); }
        web = new WebView(this);
        web.setBackgroundColor(Color.BLACK);
        web.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        web.setFocusable(true);
        web.setFocusableInTouchMode(true);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setSupportZoom(false);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        s.setTextZoom(100);
        if (Build.VERSION.SDK_INT >= 21) s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);
        web.addJavascriptInterface(new Bridge(), "PSAndroid");
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                // everything stays inside the console; external links are ignored
                String host = req.getUrl().getHost();
                return host == null || !(host.equals("127.0.0.1") || host.equals("localhost"));
            }
            @Override public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                // low-memory TVs can kill the renderer: rebuild instead of crashing the app
                Log.w(TAG, "renderer gone, recreating");
                main.post(MainActivity.this::createWebView);
                return true;
            }
        });
        root.addView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        web.loadUrl("http://127.0.0.1:" + (server != null ? server.port() : PORT) + "/");
        web.requestFocus();
    }

    @Override protected void onResume() { super.onResume(); hideSystemUi(); if (web != null) { web.onResume(); web.resumeTimers(); } }
    @Override protected void onPause() { if (web != null) { web.evaluateJavascript("window.PS&&PS.host&&PS.host.running&&PS.ui.openCC()", null); web.onPause(); } super.onPause(); }
    @Override protected void onDestroy() {
        if (inputManager != null) inputManager.unregisterInputDeviceListener(this);
        if (server != null) server.stop();
        if (web != null) web.destroy();
        super.onDestroy();
    }
    @Override public void onWindowFocusChanged(boolean hasFocus) { super.onWindowFocusChanged(hasFocus); if (hasFocus) hideSystemUi(); }

    private void hideSystemUi() {
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
    }

    // ------------------------------------------------------------------ JS bridge

    private final class Bridge {
        @JavascriptInterface public int totalMemMB() {
            ActivityManager am = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
            ActivityManager.MemoryInfo mi = new ActivityManager.MemoryInfo();
            if (am == null) return 0;
            am.getMemoryInfo(mi);
            return (int) (mi.totalMem / (1024 * 1024));
        }
        @JavascriptInterface public boolean lowRam() {
            ActivityManager am = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
            return am != null && am.isLowRamDevice();
        }
        @JavascriptInterface public String romFolder() { return romDir.getAbsolutePath(); }
        @JavascriptInterface public String lanIp() { return findLanIp(); }
        @JavascriptInterface public void exit() { main.post(MainActivity.this::finishAndRemoveTaskCompat); }
        @JavascriptInterface public void rumble(int deviceId, int ms) {
            ms = Math.max(10, Math.min(ms, 600));
            InputDevice d = InputDevice.getDevice(deviceId);
            Vibrator v = null;
            if (d != null && Build.VERSION.SDK_INT >= 16) v = d.getVibrator();
            if (v == null || !v.hasVibrator()) return;
            if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
            else v.vibrate(ms);
        }
    }

    private void finishAndRemoveTaskCompat() { if (Build.VERSION.SDK_INT >= 21) finishAndRemoveTask(); else finish(); }

    private String findLanIp() {
        String fallback = null;
        try {
            for (NetworkInterface ni : Collections.list(NetworkInterface.getNetworkInterfaces())) {
                if (!ni.isUp() || ni.isLoopback()) continue;
                String n = ni.getName().toLowerCase(Locale.US);
                for (InetAddress a : Collections.list(ni.getInetAddresses())) {
                    if (!(a instanceof Inet4Address) || a.isLoopbackAddress()) continue;
                    String ip = a.getHostAddress();
                    if (n.startsWith("wlan") || n.startsWith("eth") || n.startsWith("ap")) return ip;
                    if (a.isSiteLocalAddress() && fallback == null) fallback = ip;
                }
            }
        } catch (Exception ignored) {}
        return fallback;
    }

    // ------------------------------------------------------------------ controllers

    private static boolean isPadSource(int source) {
        return (source & InputDevice.SOURCE_GAMEPAD) == InputDevice.SOURCE_GAMEPAD
                || (source & InputDevice.SOURCE_JOYSTICK) == InputDevice.SOURCE_JOYSTICK;
    }

    /** Standard-gamepad button index for an Android key code, or -1. */
    private static int buttonIndex(int keyCode) {
        switch (keyCode) {
            case KeyEvent.KEYCODE_BUTTON_A: return 0;
            case KeyEvent.KEYCODE_BUTTON_B: return 1;
            case KeyEvent.KEYCODE_BUTTON_X: return 2;
            case KeyEvent.KEYCODE_BUTTON_Y: return 3;
            case KeyEvent.KEYCODE_BUTTON_L1: return 4;
            case KeyEvent.KEYCODE_BUTTON_R1: return 5;
            case KeyEvent.KEYCODE_BUTTON_L2: return 6;
            case KeyEvent.KEYCODE_BUTTON_R2: return 7;
            case KeyEvent.KEYCODE_BUTTON_SELECT: return 8;
            case KeyEvent.KEYCODE_BUTTON_START: return 9;
            case KeyEvent.KEYCODE_BUTTON_THUMBL: return 10;
            case KeyEvent.KEYCODE_BUTTON_THUMBR: return 11;
            case KeyEvent.KEYCODE_DPAD_UP: return 12;
            case KeyEvent.KEYCODE_DPAD_DOWN: return 13;
            case KeyEvent.KEYCODE_DPAD_LEFT: return 14;
            case KeyEvent.KEYCODE_DPAD_RIGHT: return 15;
            case KeyEvent.KEYCODE_BUTTON_MODE: return 16;
            case KeyEvent.KEYCODE_DPAD_CENTER: return 0;
            case KeyEvent.KEYCODE_BACK: return 1; // many generic pads send BACK for their B / circle button
            default: return -1;
        }
    }

    private Pad pad(InputDevice dev) {
        Pad p = pads.get(dev.getId());
        if (p == null) { p = new Pad(); p.name = dev.getName(); pads.put(dev.getId(), p); }
        return p;
    }

    private void push(int id, Pad p) {
        int mask = p.mask | p.hatMask;
        String js = String.format(Locale.US, "window.PSNative&&PSNative.pad(%d,%s,%d,%.3f,%.3f,%.3f,%.3f,%.3f,%.3f)",
                id, WebServerJson.str(p.name), mask, p.lx, p.ly, p.rx, p.ry, p.lt, p.rt);
        if (js.equals(p.lastSent)) return;
        p.lastSent = js;
        if (web != null) web.evaluateJavascript(js, null);
    }

    private void js(String code) { if (web != null) web.evaluateJavascript(code, null); }

    @Override
    public boolean dispatchKeyEvent(KeyEvent e) {
        InputDevice dev = e.getDevice();
        int code = e.getKeyCode();
        boolean fromPad = dev != null && isPadSource(e.getSource()) && !dev.isVirtual();

        if (fromPad) {
            int b = buttonIndex(code);
            if (b >= 0) {
                if (e.getRepeatCount() > 0) return true;
                Pad p = pad(dev);
                int bit = 1 << b;
                if (e.getAction() == KeyEvent.ACTION_DOWN) p.mask |= bit; else if (e.getAction() == KeyEvent.ACTION_UP) p.mask &= ~bit;
                push(dev.getId(), p);
                return true;
            }
        }
        // TV remote
        if (code == KeyEvent.KEYCODE_BACK || code == KeyEvent.KEYCODE_ESCAPE) {
            if (e.getAction() == KeyEvent.ACTION_UP) js("window.PSNative&&PSNative.back()");
            return true;
        }
        if (code == KeyEvent.KEYCODE_MENU || code == KeyEvent.KEYCODE_SETTINGS || code == KeyEvent.KEYCODE_GUIDE || code == KeyEvent.KEYCODE_INFO) {
            if (e.getAction() == KeyEvent.ACTION_UP) js("window.PSNative&&PSNative.menu()");
            return true;
        }
        return super.dispatchKeyEvent(e);
    }

    @Override
    public boolean dispatchGenericMotionEvent(MotionEvent e) {
        InputDevice dev = e.getDevice();
        if (dev != null && (e.getSource() & InputDevice.SOURCE_JOYSTICK) == InputDevice.SOURCE_JOYSTICK && e.getAction() == MotionEvent.ACTION_MOVE) {
            Pad p = pad(dev);
            p.lx = axis(e, dev, MotionEvent.AXIS_X);
            p.ly = axis(e, dev, MotionEvent.AXIS_Y);
            float rx = axis(e, dev, MotionEvent.AXIS_Z), ry = axis(e, dev, MotionEvent.AXIS_RZ);
            if (rx == 0 && ry == 0) { rx = axis(e, dev, MotionEvent.AXIS_RX); ry = axis(e, dev, MotionEvent.AXIS_RY); }
            p.rx = rx; p.ry = ry;
            p.lt = Math.max(axis(e, dev, MotionEvent.AXIS_LTRIGGER), axis(e, dev, MotionEvent.AXIS_BRAKE));
            p.rt = Math.max(axis(e, dev, MotionEvent.AXIS_RTRIGGER), axis(e, dev, MotionEvent.AXIS_GAS));
            float hx = e.getAxisValue(MotionEvent.AXIS_HAT_X), hy = e.getAxisValue(MotionEvent.AXIS_HAT_Y);
            int hat = 0;
            if (hy < -0.5f) hat |= 1 << 12; if (hy > 0.5f) hat |= 1 << 13;
            if (hx < -0.5f) hat |= 1 << 14; if (hx > 0.5f) hat |= 1 << 15;
            p.hatMask = hat;
            push(dev.getId(), p);
            return true;
        }
        return super.dispatchGenericMotionEvent(e);
    }

    private static float axis(MotionEvent e, InputDevice dev, int axis) {
        InputDevice.MotionRange r = dev.getMotionRange(axis, e.getSource());
        if (r == null) return 0f;
        float v = e.getAxisValue(axis);
        float flat = Math.max(r.getFlat(), 0.12f);
        return Math.abs(v) > flat ? v : 0f;
    }

    @Override public void onInputDeviceAdded(int deviceId) { }
    @Override public void onInputDeviceChanged(int deviceId) { }
    @Override public void onInputDeviceRemoved(int deviceId) {
        if (pads.get(deviceId) != null) { pads.remove(deviceId); js("window.PSNative&&PSNative.gone(" + deviceId + ")"); }
    }

    /** Tiny JSON string helper (kept here so the server class stays Android-free). */
    static final class WebServerJson {
        static String str(String s) {
            if (s == null) return "null";
            StringBuilder sb = new StringBuilder("\"");
            for (char c : s.toCharArray()) {
                if (c == '"' || c == '\\') sb.append('\\').append(c);
                else if (c < 0x20) sb.append(' ');
                else sb.append(c);
            }
            return sb.append('"').toString();
        }
    }
}
