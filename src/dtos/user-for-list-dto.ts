export interface UserForDetailsDto {
  id: string;
  firstName: string;
  lastName: string;
  nickName: string;
  age: number;
  mainImageUrl?: string | null;
  liked: boolean;
}