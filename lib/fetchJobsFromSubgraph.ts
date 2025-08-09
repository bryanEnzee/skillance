import { request, gql } from "graphql-request";

const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/118071/skillance/v0.0.11";

const query = gql`
  query GetJobs {
    jobs(orderBy: postedAt, orderDirection: desc, first: 20) {
      jobId
      title
      description
      skills
      budget
      durationInDays
      stakeRequired
      postedAt
      employer
      applications {
        id
        applicant
        proposal
        status
      }
    }
  }
`;

interface ApplicationData {
    id: string;
    applicant: string;
    proposal: string;
    status: string;
}

interface JobData {
  jobId: string;
  title: string;
  description: string;
  skills: string;
  budget: string;
  durationInDays: number;
  stakeRequired: string;
  postedAt: string;
  employer: string;
  applications: ApplicationData[]; 
}

interface JobsData {
  jobs: JobData[];
}

export const fetchJobsFromSubgraph = async (): Promise<{
  id: string;
  title: string;
  description: string;
  skills: string[];
  budget: string;
  duration: string;
  stakeRequired: number;
  applicants: number;
  posted: string;
  rating: number;
  urgent: boolean;
  employer: string;
  applications: ApplicationData[];
}[]> => {
  const data = await request<JobsData>(SUBGRAPH_URL, query);

  return data.jobs.map((job) => ({
    id: job.jobId,
    title: job.title,
    description: job.description || "",
    skills: JSON.parse(job.skills || "[]"),
    budget: `${Number(job.budget) / 1e18} ETH`,
    duration: `${job.durationInDays || 0} days`,
    stakeRequired: Number(job.stakeRequired || "0") / 1e18,
    applicants: job.applications ? job.applications.length : 0, 
    posted: "On-chain",
    rating: 4.8,
    urgent: false,
    employer: job.employer, 
    applications: job.applications,
  }));
};