using Microsoft.Extensions.FileProviders;
using PackageDownloader.Application;
namespace PackageDownloader.API
{
    public class Program
    {


        public static void ConfigureCors(IServiceCollection services)
        {

            services.AddCors(options =>
            {
                options.AddPolicy("AllowAnyHost", policy =>
                {
                    policy.AllowAnyOrigin()
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

            app.UseCors("AllowAnyHost");

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
