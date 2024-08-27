import { DomainException } from '../../shared/domain-exeption';

export class WebinaireUpdateForbiddenException extends DomainException {
  constructor() {
    super('Not allowed to update this webinaire');
  }
}
