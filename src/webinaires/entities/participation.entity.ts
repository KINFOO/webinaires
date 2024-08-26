import { Entity } from '../../shared/entity';

type EntityProps = { userId: string; webinaireId };

export class Participation extends Entity<EntityProps> {}
