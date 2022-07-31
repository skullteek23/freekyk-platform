import { dummyFixture } from "../../src/app/shared/interfaces/match.model";
import { CloudFunctionFixtureData } from "../../src/app/shared/interfaces/others.model";

export async function getDummyFixtures(
  data: CloudFunctionFixtureData,
  context: any
): Promise<any> {

  const fixtures: dummyFixture[] = [];
  const grTimings: any[] = data.grounds.map((gr) => gr.timings);

  // data.

  return fixtures;
}
