using Confluent.Kafka;

namespace consumerService;

public class Worker : BackgroundService
{
    private readonly string _bootstrapServers = "localhost:9092";
    private readonly string _topic = "mytopic1";

    private readonly string _groupId = "mygroup1";

    private readonly ILogger<Worker> _logger;

    public Worker(ILogger<Worker> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var config = new ConsumerConfig
        {
            GroupId = _groupId,
            BootstrapServers = _bootstrapServers,
            AutoOffsetReset = AutoOffsetReset.Earliest
        };

        using var consumer = new ConsumerBuilder<Ignore, string>(config).Build();
        consumer.Subscribe(_topic);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var msg = consumer.Consume(stoppingToken);
                _logger.LogInformation("Received following value from topic: {Value}", msg.Message.Value);

                await Task.Delay(200, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                consumer.Close();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when running Kafka consumer");
            }
        }
    }
}
