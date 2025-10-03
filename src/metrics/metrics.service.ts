import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Gauge } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_requests_total')
    public httpRequestsCounter: Counter<string>,
    
    @InjectMetric('http_request_duration_seconds')
    public httpRequestDuration: Histogram<string>,
    
    @InjectMetric('campaigns_total')
    public campaignsCounter: Counter<string>,
    
    @InjectMetric('contributions_total')
    public contributionsCounter: Counter<string>,
    
    @InjectMetric('contributions_amount_total')
    public contributionsAmountCounter: Counter<string>,
    
    @InjectMetric('active_campaigns')
    public activeCampaignsGauge: Gauge<string>,
  ) {}

  incrementHttpRequests(method: string, route: string, statusCode: number) {
    this.httpRequestsCounter.inc({ method, route, status_code: statusCode });
  }

  observeHttpDuration(method: string, route: string, duration: number) {
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  incrementCampaigns(status: string) {
    this.campaignsCounter.inc({ status });
  }

  incrementContributions(campaignId: string) {
    this.contributionsCounter.inc({ campaign_id: campaignId });
  }

  incrementContributionAmount(amount: number, currency: string = 'ETH') {
    this.contributionsAmountCounter.inc({ currency }, amount);
  }

  setActiveCampaigns(count: number) {
    this.activeCampaignsGauge.set(count);
  }
}
