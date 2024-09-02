import { DomainException } from '../../shared/domain-exeption';

export class ParticipationNotFoundException extends DomainException {
  constructor() {
    super('Participation not found');
  }
}
