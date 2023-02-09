import { MatchFixture } from '@shared/interfaces/match.model';

export async function matchUpdateTrigger(change: any, context: any): Promise<any> {

  const update = change.after.data() as MatchFixture;
  const updateID = change.after.id || '';
  if (!update || !updateID || update.status !== 4) {
    return true;
  }
}
