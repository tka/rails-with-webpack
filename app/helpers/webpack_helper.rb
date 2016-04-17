# rails 整合 webpack 用的 helper
# 開發環境要多跑一個 webpack-dev-server
require 'open-uri'
module WebpackHelper
  class CantGetResuorceError < StandardError; end

  def webpack_stylesheet_link_tag(*sources)
    begin
      sources = get_webpack_sources(sources, 'css')
      stylesheet_link_tag(*sources)

    rescue CantGetResuorceError => e
      alert_cant_get_resource(e)
    end
  end

  def webpack_javascript_include_tag(*sources)
    begin
      sources = get_webpack_sources(sources, 'js')
      javascript_include_tag(*sources)

    rescue CantGetResuorceError => e
      alert_cant_get_resource(e.message)
    end
  end

  private

  def webpack_assets_manifest
   @_manifest_file ||= if Rails.env.development?
                      cfg_file = File.join(Rails.root,"config","application.yml")
                      full_cfg = YAML.load( open(cfg_file,'r').read )
                      cfg      = full_cfg["development"] || full_cfg["default"]
                      cfg["webpack_assets_host"]+"/webpack/manifest.json"
                    else
                      Rails.root.join('public','webpack','manifest.json')
                    end

   manifest_data = open(@_manifest_file,'r'){|f| f.read}
   JSON.parse(manifest_data)
  end

  def get_webpack_sources(sources, ext)
    sources = sources.uniq.map do |source|
      if source.is_a?(String)
        source += ".#{ext}" unless source =~ /\.#{ext}\z/
        path = webpack_assets_manifest[source]

        if path
          if Rails.env.development?
            "//localhost:8080/webpack/#{path}"
          else
           "//#{Setting.assets_host}/webpack/#{path}"
          end
        else
          raise CantGetResuorceError, "無法取得 webpack 資源: #{source}"
        end
      else
        source
      end
    end
  end

  def alert_cant_get_resource(e)
    # 線上環境直接噴掉, 其他的話在網頁跳出 alert mesage
    if Rails.env.production?
      raise CantGetResuorceError, e
    else
      "<script>alert(#{e.to_json})</script>".html_safe
    end
  end
end
