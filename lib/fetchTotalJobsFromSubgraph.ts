const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/118071/skillance/v0.0.12";

export async function fetchTotalJobs() {
  const qWithConnection = `
    query {
      jobsConnection {
        totalCount
      }
    }
  `;

  const qPage = (skip: number) => `
    query {
      jobs(first: 1000, skip: ${skip}) { id }
    }
  `;

  try {
    const r = await fetch(SUBGRAPH_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: qWithConnection }),
      cache: "no-store",
    });
    const json = await r.json();
    const total = json?.data?.jobsConnection?.totalCount;
    if (typeof total === "number") {
      return { jobsCount: total };
    }
  } catch (_) {
  }

  let jobsCount = 0;
  let skip = 0;
  while (true) {
    const r = await fetch(SUBGRAPH_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: qPage(skip) }),
      cache: "no-store",
    });
    const json = await r.json();
    const page: any[] = json?.data?.jobs ?? [];
    jobsCount += page.length;
    if (page.length < 1000) break;
    skip += 1000;
  }
  return { jobsCount };
}
