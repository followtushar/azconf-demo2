import { ServiceBusClient, ServiceBusSender, ServiceBusReceiver } from '@azure/service-bus';
import { config } from '@/config';
import { logger } from '@/utils/logger';

export interface QueueJob {
  id: string;
  type: string;
  data: any;
  scheduledFor?: Date;
  attempts?: number;
  maxAttempts?: number;
}

export class QueueService {
  private serviceBusClient: ServiceBusClient | null = null;
  private sender: ServiceBusSender | null = null;
  private receiver: ServiceBusReceiver | null = null;

  constructor() {
    if (config.azure.serviceBus.connectionString) {
      this.serviceBusClient = new ServiceBusClient(config.azure.serviceBus.connectionString);
      this.sender = this.serviceBusClient.createSender(config.azure.serviceBus.queueName);
      this.receiver = this.serviceBusClient.createReceiver(config.azure.serviceBus.queueName);
    }
  }

  /**
   * Add a job to the queue
   */
  async addJob(job: Omit<QueueJob, 'id'>): Promise<void> {
    try {
      if (!this.sender) {
        logger.warn('Azure Service Bus not configured, skipping job:', job);
        return;
      }

      const message = {
        body: {
          id: this.generateJobId(),
          ...job,
        },
        messageId: this.generateJobId(),
        scheduledEnqueueTime: job.scheduledFor,
        applicationProperties: {
          jobType: job.type,
          attempts: job.attempts || 0,
          maxAttempts: job.maxAttempts || 3,
        },
      };

      await this.sender.sendMessages(message);
      logger.info(`Job added to queue: ${job.type}`);
    } catch (error) {
      logger.error('Failed to add job to queue:', error);
      throw new Error('Failed to add job to queue');
    }
  }

  /**
   * Add multiple jobs to the queue
   */
  async addJobs(jobs: Omit<QueueJob, 'id'>[]): Promise<void> {
    try {
      if (!this.sender) {
        logger.warn('Azure Service Bus not configured, skipping jobs');
        return;
      }

      const messages = jobs.map(job => ({
        body: {
          id: this.generateJobId(),
          ...job,
        },
        messageId: this.generateJobId(),
        scheduledEnqueueTime: job.scheduledFor,
        applicationProperties: {
          jobType: job.type,
          attempts: job.attempts || 0,
          maxAttempts: job.maxAttempts || 3,
        },
      }));

      await this.sender.sendMessages(messages);
      logger.info(`${jobs.length} jobs added to queue`);
    } catch (error) {
      logger.error('Failed to add jobs to queue:', error);
      throw new Error('Failed to add jobs to queue');
    }
  }

  /**
   * Process jobs from the queue
   */
  async startProcessing(jobHandlers: Record<string, (job: QueueJob) => Promise<void>>): Promise<void> {
    if (!this.receiver) {
      logger.warn('Azure Service Bus not configured, cannot process jobs');
      return;
    }

    logger.info('Starting job processing...');

    this.receiver.subscribe({
      processMessage: async (message) => {
        try {
          const job = message.body as QueueJob;
          const handler = jobHandlers[job.type];

          if (!handler) {
            logger.error(`No handler found for job type: ${job.type}`);
            await message.deadLetter({
              deadLetterReason: 'NoHandler',
              deadLetterErrorDescription: `No handler found for job type: ${job.type}`,
            });
            return;
          }

          logger.info(`Processing job: ${job.type} (${job.id})`);
          await handler(job);
          await message.complete();
          logger.info(`Job completed: ${job.type} (${job.id})`);
        } catch (error) {
          logger.error('Job processing failed:', error);
          
          const attempts = (message.applicationProperties?.attempts as number) || 0;
          const maxAttempts = (message.applicationProperties?.maxAttempts as number) || 3;

          if (attempts >= maxAttempts) {
            await message.deadLetter({
              deadLetterReason: 'MaxAttemptsExceeded',
              deadLetterErrorDescription: error.message,
            });
            logger.error(`Job failed after ${maxAttempts} attempts, moved to dead letter queue`);
          } else {
            await message.abandon();
            logger.warn(`Job failed, will retry (attempt ${attempts + 1}/${maxAttempts})`);
          }
        }
      },
      processError: async (args) => {
        logger.error('Queue processing error:', args.error);
      },
    });
  }

  /**
   * Schedule a job for future execution
   */
  async scheduleJob(job: Omit<QueueJob, 'id'>, scheduledFor: Date): Promise<void> {
    await this.addJob({
      ...job,
      scheduledFor,
    });
  }

  /**
   * Get queue statistics (if supported)
   */
  async getQueueStats(): Promise<any> {
    // Azure Service Bus doesn't provide direct queue stats through the client
    // This would require using the Management API
    return {
      activeJobs: 0,
      scheduledJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
    };
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    try {
      if (this.sender) {
        await this.sender.close();
      }
      if (this.receiver) {
        await this.receiver.close();
      }
      if (this.serviceBusClient) {
        await this.serviceBusClient.close();
      }
      logger.info('Queue service connections closed');
    } catch (error) {
      logger.error('Error closing queue service:', error);
    }
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}

// Job handlers
export const jobHandlers = {
  deliver_capsule: async (job: QueueJob) => {
    logger.info('Processing capsule delivery:', job.data);
    // Implement capsule delivery logic
    const { capsuleId } = job.data;
    
    // This would call the capsule delivery service
    // await deliverCapsule(capsuleId);
  },

  send_reminder: async (job: QueueJob) => {
    logger.info('Processing reminder:', job.data);
    // Implement reminder logic
    const { capsuleId, reminderType } = job.data;
    
    // This would call the reminder service
    // await sendReminder(capsuleId, reminderType);
  },

  process_media: async (job: QueueJob) => {
    logger.info('Processing media:', job.data);
    // Implement media processing logic
    const { mediaFileId } = job.data;
    
    // This would call the media processing service
    // await processMediaFile(mediaFileId);
  },

  cleanup_expired: async (job: QueueJob) => {
    logger.info('Processing cleanup:', job.data);
    // Implement cleanup logic
    
    // This would call the cleanup service
    // await cleanupExpiredData();
  },

  check_legacy_users: async (job: QueueJob) => {
    logger.info('Checking legacy users:', job.data);
    // Implement legacy user check logic
    
    // This would call the legacy user service
    // await checkLegacyUsers();
  },
};

// Create singleton instance
export const queueService = new QueueService();