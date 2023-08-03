# extension-base

## Getting Started

First, run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a `content.ts` file to the root of the project, importing some module and do some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!

## API Compatibility

| API             | Chrome       | Firefox      |
| --------------- | ------------ | ------------ |
| `tabs`          | ✅ Supported | ✅ Supported |
| - `query`       | ✅ Supported | ✅ Supported |
| - `sendMessage` | ✅ Supported | ✅ Supported |
| - `onUpdated`   | ✅ Supported | ✅ Supported |
| `webNavigation` | ✅ Supported | ✅ Supported |
| `cookies`       | ✅ Supported | ✅ Supported |
| `runtime`       | ✅ Supported | ✅ Supported |

## User access flow

```mermaid
graph TB
    subgraph "Main .com Site"
        A[User logs in] --> B[User accesses Chrome extension]
        L[User logs out] --> M[Show unauthenticated UI]
        P[API]
    end

    B --> C{User logged in?}

    subgraph "Content Script"
        C -->|Yes| D["Show authenticated UI"]
        D --> E["User can create, read, update, delete notes"]
        E --> Z["API call to site"]
        Z --> P
        D --> F[User can create, read, update, delete pins]
        F --> Y["API call to site"]
        Y --> P
        D --> G["User can create, read, update, delete reminders"]
        G --> X["API call to Main .com site"]
        X --> P
        D --> H{"API call returns a 403?"}
        H -->|Yes| I[Show UI to log in]
        C -->|No| M
    end

    subgraph "Popup Window"
        C -->|Yes| K[Popup window shows user information]
        C -->|No| M
    end

    style Z fill:#f9a8d4,stroke:#333,stroke-width:2px
    style Y fill:#f9a8d4,stroke:#333,stroke-width:2px
    style X fill:#f9a8d4,stroke:#333,stroke-width:2px
```

## Data flow

```mermaid
graph TD
    subgraph "Global Providers"
        A[AuthProvider - Checks the user data and confirms isAuthed]
        B[QueryClientProvider]
        C[UserLabelsProvider - Data fetching]
    end
    subgraph "Page Specific Providers"
        D[EntityProvider - Data fetching]
    end
    subgraph "LocalStorage"
        F[UserLabels Cache]
    end
    E[ActionSheet]
    A --> B
    B --> C
    C --> D
    D --> E
    C --> F[Updates Cache]
    F --> C
```
