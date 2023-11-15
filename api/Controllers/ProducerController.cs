using System.Text.Json;
using Confluent.Kafka;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class ProducerController : ControllerBase
{
    private readonly string _bootstrapServers = "localhost:9092";
    private readonly string _topic = "mytopic1";

    private static readonly string[] Summaries = new[]
    {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    };

    private readonly ILogger<ProducerController> _logger;

    public ProducerController(ILogger<ProducerController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public IEnumerable<WeatherForecast> Get()
    {
        return Enumerable.Range(1, 5).Select(index => new WeatherForecast
        {
            Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            TemperatureC = Random.Shared.Next(-20, 55),
            Summary = Summaries[Random.Shared.Next(Summaries.Length)]
        })
        .ToArray();
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> PostDelta([FromBody] JsonElement delta)
    {
        var config = new ProducerConfig
        {
            BootstrapServers = _bootstrapServers,
            ClientId = "ProducerA"
        };

        try
        {
            using var producer = new ProducerBuilder<Null, string>(config).Build();
            var result = await producer.ProduceAsync(_topic, new Message<Null, string>()
            {
                Value = delta.ToString()
            });

            _logger.LogDebug("Delivered message {Msg} to topic {Topic}", delta, _topic);
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error when sending delta {Delta}", delta);
        }

        return UnprocessableEntity();
    }
}
