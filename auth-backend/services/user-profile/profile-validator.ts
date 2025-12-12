// Profile validation with predefined choices
export interface ProfileData {
  softwareSkillLevel: 'beginner' | 'intermediate' | 'expert';
  hardwareType: 'cloud' | 'PC' | 'Jetson' | 'robot';
  preferredLanguage: string;
  roboticsExperience: 'none' | 'hobbyist' | 'professional';
}

export interface ValidationError {
  field: string;
  message: string;
}

export class ProfileValidator {
  private static readonly validSkillLevels = ['beginner', 'intermediate', 'expert'];
  private static readonly validHardwareTypes = ['cloud', 'PC', 'Jetson', 'robot'];
  private static readonly validLanguages = [
    'English', 'Urdu', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'
  ];
  private static readonly validExperienceLevels = ['none', 'hobbyist', 'professional'];

  static validateProfileData(profileData: ProfileData): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate software skill level
    if (!profileData.softwareSkillLevel) {
      errors.push({
        field: 'softwareSkillLevel',
        message: 'Software skill level is required'
      });
    } else if (!this.validSkillLevels.includes(profileData.softwareSkillLevel)) {
      errors.push({
        field: 'softwareSkillLevel',
        message: `Software skill level must be one of: ${this.validSkillLevels.join(', ')}`
      });
    }

    // Validate hardware type
    if (!profileData.hardwareType) {
      errors.push({
        field: 'hardwareType',
        message: 'Hardware type is required'
      });
    } else if (!this.validHardwareTypes.includes(profileData.hardwareType)) {
      errors.push({
        field: 'hardwareType',
        message: `Hardware type must be one of: ${this.validHardwareTypes.join(', ')}`
      });
    }

    // Validate preferred language
    if (!profileData.preferredLanguage) {
      errors.push({
        field: 'preferredLanguage',
        message: 'Preferred language is required'
      });
    } else if (!this.validLanguages.includes(profileData.preferredLanguage)) {
      errors.push({
        field: 'preferredLanguage',
        message: `Preferred language must be one of: ${this.validLanguages.join(', ')}`
      });
    }

    // Validate robotics experience
    if (!profileData.roboticsExperience) {
      errors.push({
        field: 'roboticsExperience',
        message: 'Robotics experience is required'
      });
    } else if (!this.validExperienceLevels.includes(profileData.roboticsExperience)) {
      errors.push({
        field: 'roboticsExperience',
        message: `Robotics experience must be one of: ${this.validExperienceLevels.join(', ')}`
      });
    }

    return errors;
  }

  static validateIncompleteProfile(profileData: Partial<ProfileData>): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check if at least one profile field is provided
    const hasAnyProfileData =
      profileData.softwareSkillLevel !== undefined ||
      profileData.hardwareType !== undefined ||
      profileData.preferredLanguage !== undefined ||
      profileData.roboticsExperience !== undefined;

    if (!hasAnyProfileData) {
      errors.push({
        field: 'profile',
        message: 'At least one profile field must be provided'
      });
    }

    // Validate individual fields if provided
    if (profileData.softwareSkillLevel !== undefined &&
        !this.validSkillLevels.includes(profileData.softwareSkillLevel)) {
      errors.push({
        field: 'softwareSkillLevel',
        message: `Software skill level must be one of: ${this.validSkillLevels.join(', ')}`
      });
    }

    if (profileData.hardwareType !== undefined &&
        !this.validHardwareTypes.includes(profileData.hardwareType)) {
      errors.push({
        field: 'hardwareType',
        message: `Hardware type must be one of: ${this.validHardwareTypes.join(', ')}`
      });
    }

    if (profileData.preferredLanguage !== undefined &&
        !this.validLanguages.includes(profileData.preferredLanguage)) {
      errors.push({
        field: 'preferredLanguage',
        message: `Preferred language must be one of: ${this.validLanguages.join(', ')}`
      });
    }

    if (profileData.roboticsExperience !== undefined &&
        !this.validExperienceLevels.includes(profileData.roboticsExperience)) {
      errors.push({
        field: 'roboticsExperience',
        message: `Robotics experience must be one of: ${this.validExperienceLevels.join(', ')}`
      });
    }

    return errors;
  }

  static isValidProfileData(profileData: ProfileData): boolean {
    return this.validateProfileData(profileData).length === 0;
  }
}