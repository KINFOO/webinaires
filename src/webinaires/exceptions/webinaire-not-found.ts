import { DomainException } from '../../shared/domain-exeption';

export class WebinaireNotFoundException extends DomainException {
  constructor() {
    super('Webinaire not found');
  }
}
