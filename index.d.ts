interface PackageJsonOptions {
  version?: string;
  fullMetadata?: boolean;
  allVersions?: boolean;
}

type PackageJson = (name: string, options?: PackageJsonOptions) => {};

declare const packageJson: PackageJson;
export = packageJson;
