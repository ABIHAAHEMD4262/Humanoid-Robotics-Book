# Authentication and Personalization Features

This document describes the authentication and personalization features implemented for the Humanoid Robotics Book.

## Authentication

The application uses Better-Auth for user authentication with the following features:

- Email/password authentication
- Server-side sessions with secure cookies
- Custom user profile fields for personalization

### User Profile Fields

During signup, users provide the following information:

- Software Skill Level: beginner, intermediate, expert
- Hardware Type: cloud, PC, Jetson, robot
- Preferred Language: English, Urdu, Spanish, French, German, Chinese, Japanese
- Robotics Experience: none, hobbyist, professional

## Personalization

The personalization system generates customized chapter content based on user profile information.

### How it Works

1. User signs up and provides profile information
2. When viewing a chapter, user clicks the "Personalize" button
3. System generates customized content based on user's profile
4. Personalized content is cached for performance
5. Subsequent requests return the cached personalized content

### Personalization Logic

Content is transformed based on user profile:

- **Skill Level**: Beginners get more detailed explanations, experts get advanced content
- **Hardware Type**: Examples and references are tailored to the user's hardware
- **Experience Level**: Content complexity is adjusted based on robotics experience

### Performance

- Personalized content is generated within 5 seconds
- Content is cached with configurable expiration (default: 1 hour)
- Error handling with fallback to original content if personalization fails

## Security

- All authentication is handled server-side
- No sensitive credentials are exposed to the client
- Secure session cookies are used for authentication
- Profile data is validated against predefined choices