# DeltaX - AI Agent Platform for Consultants & Coaches

A modern web platform enabling consultants and coaches to build, customize, and deploy AI agents without coding.

## Features

### MVP Features

**Home Page**

- Value proposition and benefits for consultants & coaches
- Video testimonials from successful users
- Links to agents created by coaches

**Consultant Access**

- **Knowledge Base**: Upload and version control frameworks, materials, and tutorials
- **Agent Space**: Build and configure custom AI agents with guided templates
- **Services**: Offer multiple services beyond chat (scheduling, lead qualification, resource sharing)
- **Personalization**: Brand agents with custom logos, colors, and descriptions
- **Test & Deploy**: Manage multiple agent versions with quality testing before deployment
- **Dashboard**: Track analytics, user engagement, and lead qualification metrics

**Public View**

- Users can engage in conversations with deployed agents
- Request specific services
- Multi-session engagement support

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (via Radix UI)
- **Animations**: Framer Motion
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/
│   ├── Navbar.tsx
│   └── Footer.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── ConsultantDashboard.tsx
│   ├── KnowledgeBase.tsx
│   ├── AgentSpace.tsx
│   ├── Services.tsx
│   ├── Personalization.tsx
│   ├── TestDeploy.tsx
│   ├── Dashboard.tsx
│   └── PublicAgentView.tsx
├── App.tsx
├── main.tsx
└── index.css
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Pages Overview

### Home Page (`/`)

Landing page with value proposition, benefits, features, testimonials, and CTA.

### Consultant Dashboard (`/dashboard`)

Overview of all created agents with quick stats and management options.

### Knowledge Base (`/knowledge-base`)

Upload, manage, and version control all frameworks and materials for agents.

### Agent Space (`/agent-space`)

Create and configure new AI agents with templates and guided configuration.

### Services (`/services`)

Configure additional services like lead qualification, scheduling, and resource sharing.

### Personalization (`/personalization`)

Brand customization including logos, colors, fonts, and business descriptions.

### Test & Deploy (`/test-deploy`)

Manage multiple agent versions, run tests, and deploy to production.

### Analytics Dashboard (`/analytics`)

Track user engagement, conversation metrics, and lead qualification data.

### Public Agent View (`/agent/:agentId`)

Public-facing agent interface for end users to interact with deployed agents.

## Key Features

### Agent Configuration

- Choose from pre-built templates
- Customize agent personality and behavior
- Select knowledge base for context
- Enable/disable services

### Version Management

- Create multiple versions of agents
- Test before deployment
- Track deployment history
- Rollback capabilities

### Analytics & Insights

- Real-time engagement metrics
- User intent classification (High/Medium/Low)
- Conversation analytics
- User segmentation

### Personalization

- Upload custom logos and images
- Set brand colors and fonts
- Add business descriptions
- Social media links integration

## Development

### Code Style

- TypeScript for type safety
- Functional components with React hooks
- Tailwind CSS for styling
- Framer Motion for animations

### Component Structure

- Reusable components in `/components`
- Page components in `/pages`
- Responsive design with mobile-first approach
- Accessible UI with semantic HTML

## Future Enhancements

- Backend API integration
- User authentication and authorization
- Real-time chat functionality
- Advanced analytics and reporting
- Integration with external services
- Mobile app version
- Multi-language support

## License

MIT

## Support

For support, please contact the development team.
