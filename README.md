# minimal-kafka-dotnet

A basic beginner-friendly example of the communication flow between a Web client, an internal ASP.NET API and a Kafka topic consumer. The architecure looks like:

![MinimalKafka drawio](https://github.com/helfo2/minimal-kafka-dotnet/assets/22845467/5f7373e2-7ef3-4130-8ee2-d495a25dae9f)

## Dependencies

To use this repo, you need:

- Docker
- ASP.NET
- NPM
- Dotnet CLI

## How to run it

The easiest way is with [dotnet run-script](https://github.com/xt0rted/dotnet-run-script), with the following steps:

1. Navigate to the root folder
2. [Install the dotnet run-script tool](https://github.com/xt0rted/dotnet-run-script#installation)
3. Open a terminal and run `dotnet r run:infra` (that will start the Kafka environement)
4. Open another terminal and run `dotnet r run:api` (that will start the ASP.NET proucer HTTP API)
5. Open another terminal and run `dotnet r run:consumer` (that will start the ASP.NET consumer background service)
6. Open another terminal and run `dotnet r run:presentation` (that will start the React web client)

Those commands are avilable in the `global.json` file at the root of the project. 

Remember to watch out for the CORS policy in the API case your local ports are different.

## The data

The Web client is written in React and run a [QuillJs](https://quilljs.com/) HTML text editor. The editor detects changes as [deltas of text operations](https://quilljs.com/docs/delta/), for example:

```javascript
{
  ops: [
    { insert: 'Gandalf', attributes: { bold: true } },
    { insert: ' the ' },
    { insert: 'Grey', attributes: { color: '#cccccc' } }
  ]
}
```

And these deltas are sent accross all the way to the consumer. 

## Analysis: pros and cons

This architecture for a distributed data flow has many **advantages**:

1. **Reliability**: Kafka is a log-based message broker. From a distributed system perspective, it means that messages are persisted in logs and the document can be rebuilt from any point in time. Replication and redundancy are also easily achievable
2. **Scalability**: in terms of number of users making concurrent changes, the it is easily scalable. There is no need for distributed transactions and even 2PC is unnecessary. Nodes all agree that the single source of truth is the Kafka topic. A topic per document should suffice for the entire lifetime of changes
3. **Maintainability**: a [conflict resolution algorithm](https://stackoverflow.com/questions/31092669/how-does-google-docs-deal-with-editing-collisions) is essentially where all of the complexity will be. Horizontal scaling on demand (i.e. load balancing and replication for the API and consumer services, dynamic topic management) is a possible solution for any other complexity
4. **Open source-ness**: the tech stack is all open source :) (verifiable, maintainable and community-driven)

It also has some manageable **disadvantages**: 

1. **Complexity**: the conflict resolution distributed algorithm will be complex and might be a single point of failure
2. **Cost**: the persistence of data and overhead of processing could incur in computational cost
