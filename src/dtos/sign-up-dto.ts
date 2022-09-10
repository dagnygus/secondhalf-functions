export interface SignUpDto {
  firstName: string;
  lastName: string;
  nickName: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string;
	aboutMySelf?: string;
	dateOfBirth: string;
}

export enum SignUpDtoFieldNames {
  firstName = "firstName",
  lastName = "lastName",
  nickName = "nickName",
  email = "email",
  password = "password",
  confirmPassword = "confirmPassword",
  gender = "gender",
  aboutMySelf = "aboutMySelf",
  dateOfBirth = "dateOfBirth",
}