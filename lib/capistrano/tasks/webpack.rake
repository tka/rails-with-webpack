namespace :deploy do
  namespace :assets do
    task :webpack do
      on roles(:web) do
        within release_path do
          execute :npm, "install"
          execute :webpack
        end
      end
    end
  end
end

before "deploy:assets:precompile", "deploy:assets:webpack"
