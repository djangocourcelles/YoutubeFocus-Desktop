use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::WebviewWindowBuilder::new(
                app,
                "main",
                tauri::WebviewUrl::App("/".into()),
            )
            .title("YoutubeFocus")
            .inner_size(1280.0, 800.0)
            .min_inner_size(960.0, 600.0)
            .on_navigation(move |url| {
                let url_str = url.to_string();
                // Intercepte le callback OAuth Google (qui pointe vers le dev server,
                // inexistant en production) et redirige vers l'URL interne Tauri.
                if url_str.starts_with("http://localhost:5173/callback") {
                    let handle = handle.clone();
                    let fragment = url_str
                        .split('#')
                        .nth(1)
                        .unwrap_or("")
                        .to_string();
                    tauri::async_runtime::spawn(async move {
                        if let Some(window) = handle.get_webview_window("main") {
                            // macOS/Linux : tauri://localhost — Windows : http://tauri.localhost
                            #[cfg(target_os = "windows")]
                            let base = "http://tauri.localhost";
                            #[cfg(not(target_os = "windows"))]
                            let base = "tauri://localhost";
                            let redirect = format!("{}/callback#{}", base, fragment);
                            if let Ok(parsed) = tauri::Url::parse(&redirect) {
                                let _ = window.navigate(parsed);
                            }
                        }
                    });
                    return false;
                }
                true
            })
            .build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
