# Physical AI & Humanoid Robotics Book

A comprehensive, hands-on guide to building intelligent robots that interact with the physical world. Learn ROS 2, digital twin simulation, and vision-language-action models through practical projects.

**Live Site**: https://ABIHAAHEMD4262.github.io/Humanoid-Robotics-Book/

This website is built using [Docusaurus 3](https://docusaurus.io/), a modern static website generator.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Local Development

```bash
npm start
```

This command starts a local development server and opens http://localhost:3000/Humanoid-Robotics-Book/ in your browser. Most changes are reflected live without having to restart the server.

### Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Serve Locally

```bash
npm run serve
```

Serves the built website locally to test the production build.

## 📚 Book Structure

### Module 1: The Robotic Nervous System (ROS 2)
- Chapter 1: Core Communication Patterns (nodes, topics, services, actions)
- Chapter 2: Python Development with rclpy
- Chapter 3: Robot Description with URDF & Xacro
- Chapter 4: ROS 2 Packages & Build Systems
- Chapter 5: Mini-Project - Walking Gait Publisher

### Module 2: Digital Twin & Simulation
- Gazebo and Unity integration
- Isaac Sim workflows
- Physics simulation

### Module 3: AI-Robot Brain (NVIDIA Isaac Platform)
- Domain randomization
- Sim2Real transfer
- Navigation systems

### Module 4: Vision-Language-Action Models
- VLA pipeline integration
- LLM task planning
- Conversational humanoids

## 🌐 Deployment

This site automatically deploys to GitHub Pages when you push to the `main` or `001-ai-native-book` branch.

### Automatic Deployment (Recommended)

The site uses GitHub Actions for automatic deployment:

1. Push changes to `main` or `001-ai-native-book` branch
2. GitHub Actions automatically builds and deploys
3. Site is live at https://ABIHAAHEMD4262.github.io/Humanoid-Robotics-Book/

### Manual Deployment (if needed)

```bash
npm run build
# Manually upload the build/ directory to your hosting service
```

## 🛠️ Development

### Project Structure

```
Humanoid-Robotics-Book/
├── docs/                  # Documentation pages
│   ├── intro.md
│   ├── module1-ros2/      # Module 1 chapters
│   ├── module2-digital-twin/
│   ├── module3-isaac-platform/
│   ├── module4-vla/
│   └── appendices/
├── src/
│   ├── components/        # React components
│   ├── css/              # Custom styles
│   └── pages/            # Custom pages
├── static/               # Static assets
├── docusaurus.config.ts  # Docusaurus configuration
└── sidebars.ts          # Sidebar configuration
```

### Technologies Used

- **Docusaurus 3.9.2**: Static site generator
- **React 18**: UI framework
- **TypeScript**: Type-safe development
- **MDX**: Markdown with JSX
- **GitHub Pages**: Hosting
- **GitHub Actions**: CI/CD

## 📖 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

Built with ❤️ using Docusaurus and modern web technologies.
