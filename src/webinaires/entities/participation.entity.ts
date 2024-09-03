import { Entity } from '../../shared/entity';

type EntityProps = { userId: string; webinaireId: string };

export class Participation extends Entity<EntityProps> {}
