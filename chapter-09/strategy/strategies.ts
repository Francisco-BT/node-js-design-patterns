import YAML from 'yaml'
import TOML from 'smol-toml'

import { ConfigData } from './configData'

export type FormatStrategy = {
  deserialize: (data: string) => ConfigData
  serialize: (data: ConfigData) => string
}

export const jsonStrategy: FormatStrategy = {
  deserialize: function (data: string): ConfigData {
    return JSON.parse(data)
  },
  serialize: function (data: ConfigData): string {
    return JSON.stringify(data, null, 2)
  }
}

export const yamlStrategy: FormatStrategy = {
  deserialize: function (data: string): ConfigData {
    return YAML.parse(data)
  },
  serialize: function (data: ConfigData): string {
    return YAML.stringify(data, { indent: 2 })
  }
}

export const tomlStrategy: FormatStrategy = {
  deserialize: function (data: string): ConfigData {
    return TOML.parse(data) as ConfigData
  },
  serialize: function (data: ConfigData): string {
    return TOML.stringify(data)
  }
}
