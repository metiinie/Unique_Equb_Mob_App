import { UserAccount } from '../entities/user_account';
import { PhoneNumberEt } from '../value_objects/phone_number_et';

export interface AuthRepository {
  requestOtp(phoneNumber: PhoneNumberEt): Promise<void>;

  verifyOtp({
    phoneNumber,
    code,
  }: {
    phoneNumber: PhoneNumberEt;
    code: string;
  }): Promise<UserAccount>;
}
