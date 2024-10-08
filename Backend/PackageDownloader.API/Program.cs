using Microsoft.Extensions.FileProviders;
using PackageDownloader.Application;
namespace PackageDownloader.API
{
    public class Program
    {

      
        public static void ConfigureCors(IServiceCollection services)
        {
            // ���������� CORS ��������
            services.AddCors(options =>
            {
                options.AddPolicy("AllowLocalhost3000", policy =>
                {
                    policy.WithOrigins("http://localhost:3000")
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });
        }

        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            ConfigureCors(builder.Services);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddPackageDownloaderServices();

            var app = builder.Build();

            // ���������� �������� CORS
            app.UseCors("AllowLocalhost3000");

            // Configure the HTTP request pipeline.
            //if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseAuthorization();

            app.UseFileServer(new FileServerOptions()
            {
                FileProvider = new PhysicalFileProvider(
                Path.Combine(Directory.GetCurrentDirectory(), "UI")),
                RequestPath = "/UI",
                EnableDefaultFiles = true
            });

            app.MapControllers();

            app.Run();
        }
    }
}
