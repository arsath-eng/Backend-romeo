export class SpecialUserDto {
  userId: string;

  type: string;

  email: string;

  firstName: string;

  lastName: string;

  companies: {
    companyId: string,
    accessLevelId: string,
    isActive: boolean
  }[];
}

export class PostSpecialUserDto {
  userId: string;

  type: string;

  email: string;

  firstName: string;

  lastName: string;

  companyId: string;

  accessLevelId: string;
}

export class PutSpecialUserDto {

  id: string;

  companyId: string;

  accessLevelId: string;

  isActive: boolean;

  lastName: string;

  firstName: string;
}

export class PostSwitchToSpecialUserDto {

  employeeId: string;

  type: string;
}
