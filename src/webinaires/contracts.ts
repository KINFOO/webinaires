import { z } from 'zod';
import { WebinaireDTO } from './dto/webinaire.dto';

export namespace WebinaireAPI {
  export namespace OrganizeWebinaire {
    export const schema = z.object({
      title: z.string(),
      seats: z.number(),
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
    });
    export type Request = z.infer<typeof schema>;
    export type Response = { id: string };
  }

  export namespace ChangeDates {
    export const schema = z.object({
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
    });
    export type Request = z.infer<typeof schema>;
    export type Response = void;
  }

  export namespace ChangeSeats {
    export const schema = z.object({
      seats: z.number(),
    });
    export type Request = z.infer<typeof schema>;
    export type Response = void;
  }

  export namespace DeleteWebinaire {
    export type Response = void;
  }
  export namespace ReserveSeats {
    export type Response = void;
  }
  export namespace CancelSeats {
    export type Response = void;
  }

  export namespace GetWebinaireById {
    export type Response = WebinaireDTO;
  }
}
