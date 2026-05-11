import YAML from 'yaml'

import { ConfigTemplate } from './configTemplate.js'

export class YamlConfig extends ConfigTemplate {
  _serialize(data) {
    return YAML.stringify(data)
  }

  _deserialize(data) {
    return YAML.parse(data)
  }
}
