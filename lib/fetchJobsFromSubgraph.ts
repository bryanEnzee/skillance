import { request, gql } from "graphql-request";

const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/118071/skillance/v0.0.10";

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
    }
  }
`;

// Define interface for one job item
interface Job {
  jobId: string;
  title: string;
  description: string;
  skills: string;
  budget: string;
  durationInDays: number;
  stakeRequired: string;
  postedAt: string;
}

// Define interface for the query response
interface JobsData {
  jobs: Job[];
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
}[]> => {
  // Tell request what data shape to expect
  const data = await request<JobsData>(SUBGRAPH_URL, query);

  // Post-process and return typed jobs
  return data.jobs.map((job) => ({
    id: job.jobId,
    title: job.title,
    description: job.description || "",
    skills: JSON.parse(job.skills || "[]"),
    budget: `${Number(job.budget) / 1e18} ETH`,
    duration: `${job.durationInDays || 0} days`,
    stakeRequired: Number(job.stakeRequired || 0) / 1e18,
    applicants: 0,
    posted: "On-chain",
    rating: 4.8,
    urgent: false,
  }));
};
