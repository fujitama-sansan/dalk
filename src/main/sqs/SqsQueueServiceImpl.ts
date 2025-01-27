import { SQS } from '@aws-sdk/client-sqs'
import { SqsQueue, SqsQueueService } from '../../common/interface'
import { Result, resultify } from '../../common/util/Result'

const getNameFromUrl = (url: string): string => {
  const parts = url.split('/')
  return parts[parts.length - 1]
}

export class SqsQueueServiceImpl implements SqsQueueService {
  listQueues(prefix: string): Promise<Result<ReadonlyArray<SqsQueue>>> {
    return resultify(async () => {
      const sqs = new SQS()
      const params = {
        QueueNamePrefix: prefix
      }
      const data = await sqs.listQueues(params)
      return (
        data.QueueUrls?.map((url) => ({
          name: getNameFromUrl(url),
          url
        })) || []
      )
    })
  }

  send(queue: SqsQueue, message: string): Promise<Result<void>> {
    return resultify(async () => {
      const sqs = new SQS()
      const params = {
        MessageBody: message,
        QueueUrl: queue.url
      }
      await sqs.sendMessage(params)
    })
  }
}
