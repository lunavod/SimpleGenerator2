# SimpleGenerator 2

Generating boilerplate for you )

## Directory structure

 ```
  .sg/                         -- Root directory
      MySuperComponent/        -- Template directory
          files/               -- Directory for template files
              {$foo}.css       -- Template files. You can use variables in file name, with {$var} syntax.
              {$bar}.js.ejs    -- Template files. All files are processed with ejs.
          config.json          -- Config
```

## `config.json` structure

```
  {
    "path": "components",
    "variables": {
      "foo": ["string", "Bar", "What should foo value be?"]
    }
  }
```

```
  path - output folder
  variables - array of variables available in template.
      Key - variable name
      Value - array of one or more elements:
          1. Variable type (bool/string for now)
          2. Default value
          3. Prompt
```
