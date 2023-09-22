using System.Threading;

Thread.Sleep(2000);

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

//Create the log file and its path if it doesn't exist, and empty it if it does
var path = app.Configuration["LogPath"];
Directory.CreateDirectory(path);
File.Create(path + "/service2.log").Close();

app.Run();
