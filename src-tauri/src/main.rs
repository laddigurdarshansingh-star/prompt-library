// Prevents console window on Windows in ALL builds (debug + release)
#![windows_subsystem = "windows"]

fn main() {
    prompt_library_lib::run()
}
