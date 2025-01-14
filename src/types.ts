/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Roll {
  slug: string;
  data: {
    roll_id: number;
    roll_year: number;
    roll_month: number;
    title: string;
    camera: string;
    film?: string;
    developer?: string;
    location?: string | string[];
    start_date: string;
    end_date?: string;
    images?: Array<{
      image: any;
      alt?: string;
      feature?: string;
    }>;
    film_speed?: string;
    comments?: string;
    tags?: string[];
  };
}
