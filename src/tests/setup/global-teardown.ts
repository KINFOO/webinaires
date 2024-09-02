import { stopDocker } from './docker-magager';

const teardown = async () => {
  await stopDocker();
};

export default teardown;
