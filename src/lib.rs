use zed_extension_api::{self as zed, Result};

struct MojoExtension {
    cached_binary_path: Option<String>,
}

impl MojoExtension {
    fn language_server_binary_path(&mut self, config: zed::LanguageServerConfig) -> Result<String> {
        if let Some(path) = &self.cached_binary_path {
            if let Ok(stat) = std::fs::metadata(path) {
                if stat.is_file() {
                    return Ok(path.clone());
                }
            }
        }

        zed::set_language_server_installation_status(
            &config.name,
            &zed::LanguageServerInstallationStatus::CheckingForUpdate,
        );

        let release = zed::latest_github_release(
            "modular/mojo",
            zed::GithubReleaseOptions {
                require_assets: true,
                pre_release: false,
            },
        )?;

        let (platform, arch) = zed::current_platform();
        let asset_name = format!(
            "magic-{}-{}.{}",
            arch,
            platform,
            if platform == "windows" { "exe" } else { "tar.gz" }
        );

        let asset = release
            .assets
            .iter()
            .find(|asset| asset.name == asset_name)
            .ok_or_else(|| format!("no asset found matching '{}'", asset_name))?;

        let version_dir = format!("magic-{}", release.version);
        let binary_path = format!("{version_dir}/magic");

        if !std::fs::metadata(&binary_path).map_or(false, |stat| stat.is_file()) {
            zed::set_language_server_installation_status(
                &config.name,
                &zed::LanguageServerInstallationStatus::Downloading,
            );

            zed::download_file(
                &asset.download_url,
                &version_dir,
                zed::DownloadedFileType::GzipTar,
            )
            .map_err(|e| format!("failed to download file: {e}"))?;

            let entries =
                std::fs::read_dir(".").map_err(|e| format!("failed to list working directory {e}"))?;
            for entry in entries {
                let entry = entry.map_err(|e| format!("failed to load directory entry {e}"))?;
                if entry.file_name().to_str() != Some(&version_dir) {
                    std::fs::remove_dir_all(&entry.path()).ok();
                }
            }
        }

        self.cached_binary_path = Some(binary_path.clone());
        Ok(binary_path)
    }
}

impl zed::Extension for MojoExtension {
    fn new() -> Self {
        Self {
            cached_binary_path: None,
        }
    }

    fn language_server_command(
        &mut self,
        config: zed::LanguageServerConfig,
        _worktree: &zed::Worktree,
    ) -> Result<zed::Command> {
        let magic_path = self.language_server_binary_path(config)?;
        
        Ok(zed::Command {
            command: magic_path,
            args: vec!["run".to_string(), "mojo-lsp-server".to_string()],
            env: Default::default(),
        })
    }
}

zed::register_extension!(MojoExtension);