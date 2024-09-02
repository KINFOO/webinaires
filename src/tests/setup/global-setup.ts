import { startDocker } from './docker-magager';

const setup = async () => {
  await startDocker();
};

export default setup;
