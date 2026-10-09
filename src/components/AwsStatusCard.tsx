import { useWasteData } from '../data/DataContext';
import './AwsStatusCard.css';

export default function AwsStatusCard() {
  const { awsStatus, awsStatusLoading, refreshAwsStatus } = useWasteData();

  function statusBadge(status: string) {
    switch (status) {
      case 'CONNECTED':
        return <span className="badge-connected">CONNECTED</span>;
      case 'READY':
        return <span className="badge-ready">READY</span>;
      case 'UNAVAILABLE':
        return <span className="badge-unavailable">UNAVAILABLE</span>;
      case 'NOT CONFIGURED':
        return <span className="badge-not-configured">NOT CONFIGURED</span>;
      case 'ERROR':
        return <span className="badge-error">ERROR</span>;
      default:
        return <span className="badge-not-configured">{status}</span>;
    }
  }

  const services = [
    {
      name: 'Amazon S3',
      role: 'Object Storage & Datasets',
      status: awsStatus?.services?.s3?.status || 'PROBING',
      detail: awsStatus?.services?.s3?.bucket || 'raw / processed / demo',
    },
    {
      name: 'AWS Glue',
      role: 'Schema Catalog & ETL',
      status: awsStatus?.services?.glue?.status || 'PROBING',
      detail: awsStatus?.services?.glue?.database || 'wastesignal_db',
    },
    {
      name: 'Amazon Athena',
      role: 'Analytical Query Engine',
      status: awsStatus?.services?.athena?.status || 'PROBING',
      detail: awsStatus?.services?.athena?.workgroup ? `Workgroup: ${awsStatus.services.athena.workgroup}` : 'primary workgroup',
    },
    {
      name: 'Amazon Bedrock',
      role: 'Operational Explanation Layer',
      status: awsStatus?.services?.bedrock?.status || 'PROBING',
      detail: awsStatus?.services?.bedrock?.modelId || 'amazon.nova-micro-v1:0',
    },
    {
      name: 'Amazon SageMaker',
      role: 'ML Training & Inference',
      status: awsStatus?.services?.sagemaker?.status || 'NOT CONFIGURED',
      detail: 'Local statistical engine active (SageMaker interface ready)',
    },
    {
      name: 'AWS Lambda / API Gateway',
      role: 'Serverless API Layer',
      status: awsStatus?.services?.lambda?.status || 'READY',
      detail: awsStatus?.services?.lambda?.environment === 'AWS_LAMBDA' ? 'Lambda Runtime' : 'Express Proxy (server/lambda.ts)',
    },
  ];

  return (
    <div className="card aws-status-container">
      <div className="aws-status-header">
        <div className="aws-status-title-row">
          <div className="aws-icon-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            </svg>
          </div>
          <div>
            <h3 className="heading-section">AWS Data & AI Infrastructure</h3>
            <span className="text-meta" style={{ marginTop: 2 }}>
              CLOUD INTELLIGENCE LAYER • REGION: {awsStatus?.region || 'ap-southeast-2'}
            </span>
          </div>
        </div>
        <button
          className="btn-outline"
          onClick={refreshAwsStatus}
          disabled={awsStatusLoading}
          style={{ fontSize: '11px', padding: '6px 12px' }}
        >
          {awsStatusLoading ? 'Probing...' : 'Probe Live AWS Status'}
        </button>
      </div>

      <div className="aws-services-grid">
        {services.map((srv, idx) => (
          <div key={idx} className="aws-service-card">
            <div className="aws-service-header">
              <span className="aws-service-name">{srv.name}</span>
              {statusBadge(srv.status)}
            </div>
            <span className="aws-service-role">{srv.role}</span>
            <span className="aws-service-detail" title={srv.detail}>{srv.detail}</span>
          </div>
        ))}
      </div>

      <div className="aws-status-footer">
        <span>
          VERIFICATION TIMESTAMP: {awsStatus?.timestamp ? new Date(awsStatus.timestamp).toLocaleTimeString() : 'Awaiting initial probe'}
        </span>
        <span>
          OVERALL INFRASTRUCTURE HEALTH: <strong>{awsStatus?.overallStatus || 'OPERATIONAL'}</strong>
        </span>
      </div>
    </div>
  );
}
