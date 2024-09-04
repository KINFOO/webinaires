import { WebinaireDTO } from '../dto/webinaire.dto';

export const I_GET_WEBINAIRE_BY_ID_QUERY = 'I_GET_WEBINAIRE_BY_ID_QUERY';

export interface IGetWebinaireByIdQuery {
  execute(id: string): Promise<WebinaireDTO>;
}
