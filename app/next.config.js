module.exports = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    });

    return config;
  },
  compilerOptions: {
    baseUrl: "."
  },
  typescript: {
    // NOTE: nexus prisma blows in its current state
    // its causing a massive type error in build
    // this needs to be enabled to build for the chrome extension
    // i can come back to this when prisma updates their nexus plugin
    ignoreBuildErrors: true,
  }
};