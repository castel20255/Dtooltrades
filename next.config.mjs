import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Handle CSS modules from node_modules - prevent mini-css-extract-plugin errors
    // by using a simple pass-through loader for CSS in node_modules
    config.module.rules.push({
      test: /\.css$/i,
      include: /node_modules/,
      use: {
        loader: 'style-loader',
      },
    })
    return config
  },
}

export default nextConfig
