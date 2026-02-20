# Canteen Management System — UML & Behavioral Diagrams

**Date:** 2026-02-20
**Purpose:** Client/stakeholder documentation — visual representation of system behavior, workflows, and architecture.
**Rendering:** All diagrams use [Mermaid](https://mermaid.js.org/) syntax. Renderable in GitHub, VS Code, Notion, Confluence, or export to PNG/SVG via `mmdc` (mermaid-cli).

---

## Table of Contents

1. [Use Case Diagram](#1-use-case-diagram)
2. [Activity Diagrams](#2-activity-diagrams)
   - 2.1 User Authentication
   - 2.2 Menu Setup Workflow
   - 2.3 Display Screen Resolution (WebSocket variant)
   - 2.4 Display Screen Resolution (Polling variant)
   - 2.5 Token Management
3. [Sequence Diagrams](#3-sequence-diagrams)
   - 3.1 User Login
   - 3.2 Create Item with Image Upload
   - 3.3A Display Screen — WebSocket variant
   - 3.3B Display Screen — Short Polling variant
   - 3.4A Token Update — WebSocket variant
   - 3.4B Token Update — Short Polling variant
4. [State Machine Diagrams](#4-state-machine-diagrams)
   - 4.1A Display Screen States (WebSocket)
   - 4.1B Display Screen States (Polling)
   - 4.2 User Session Lifecycle
5. [Component Diagram](#5-component-diagram)
   - 5A WebSocket Architecture
   - 5B Polling Architecture
6. [Entity Relationship Diagram](#6-entity-relationship-diagram)
7. [Deployment Diagram](#7-deployment-diagram)
8. [Data Flow Overview](#8-data-flow-overview)
   - 8A WebSocket Data Flow
   - 8B Polling Data Flow

---

## 1. Use Case Diagram

Shows all actors and what they can do in the system.

```mermaid
graph TB
    subgraph Actors
        Admin["Admin"]
        RM["Restaurant Manager"]
        TO["Token Operator"]
        DS["Display Screen<br/>(TV/Monitor)"]
    end

    subgraph System["Canteen Management System"]
        subgraph Authentication
            UC_Login["Login"]
            UC_Logout["Logout"]
            UC_ChangePwd["Change Password"]
        end

        subgraph User_Management["User Management"]
            UC_CreateUser["Create User Account"]
            UC_EditUser["Edit User Account"]
            UC_DeactivateUser["Deactivate User"]
            UC_ViewUsers["View All Users"]
        end

        subgraph Item_Management["Item Management"]
            UC_CreateItem["Create Food Item"]
            UC_EditItem["Edit Food Item"]
            UC_DeleteItem["Delete Food Item"]
            UC_UploadImage["Upload Item Image"]
            UC_ToggleItem["Activate/Deactivate Item"]
        end

        subgraph Menu_Management["Menu Management"]
            UC_CreateMenu["Create Menu"]
            UC_EditMenu["Edit Menu"]
            UC_DeleteMenu["Delete Menu"]
            UC_AssignItems["Assign Items to Menu"]
        end

        subgraph Screen_Management["Screen Management"]
            UC_CreateScreen["Create Screen"]
            UC_EditScreen["Edit Screen"]
            UC_DeleteScreen["Delete Screen"]
            UC_ConfigTimeSlots["Configure Time Slots"]
            UC_SetBackground["Set Background Media"]
            UC_ConfigDisplay["Configure Display Settings"]
        end

        subgraph Display_Features["Display Features"]
            UC_ViewGallery["View Gallery Display"]
            UC_AutoMenuSwitch["Auto Menu Switching"]
            UC_ViewCurrentMenu["View Current Menu"]
        end

        subgraph Token_System["Token/Serving System"]
            UC_UpdateToken["Update Serving Token"]
            UC_ClearTokens["Clear Token History"]
            UC_ViewToken["View Current Token"]
            UC_AnnounceToken["Voice Announcement"]
        end

        subgraph Audit["Audit & Logging"]
            UC_ViewLogs["View Activity Logs"]
            UC_FilterLogs["Filter Logs"]
            UC_AutoLog["Auto-Log All Changes"]
        end
    end

    Admin --> UC_Login
    Admin --> UC_Logout
    Admin --> UC_ChangePwd
    Admin --> UC_CreateUser
    Admin --> UC_EditUser
    Admin --> UC_DeactivateUser
    Admin --> UC_ViewUsers
    Admin --> UC_CreateItem
    Admin --> UC_EditItem
    Admin --> UC_DeleteItem
    Admin --> UC_UploadImage
    Admin --> UC_ToggleItem
    Admin --> UC_CreateMenu
    Admin --> UC_EditMenu
    Admin --> UC_DeleteMenu
    Admin --> UC_AssignItems
    Admin --> UC_CreateScreen
    Admin --> UC_EditScreen
    Admin --> UC_DeleteScreen
    Admin --> UC_ConfigTimeSlots
    Admin --> UC_SetBackground
    Admin --> UC_ConfigDisplay
    Admin --> UC_UpdateToken
    Admin --> UC_ClearTokens
    Admin --> UC_ViewLogs
    Admin --> UC_FilterLogs

    RM --> UC_Login
    RM --> UC_Logout
    RM --> UC_ChangePwd
    RM --> UC_CreateItem
    RM --> UC_EditItem
    RM --> UC_UploadImage
    RM --> UC_CreateMenu
    RM --> UC_EditMenu
    RM --> UC_AssignItems
    RM --> UC_EditScreen
    RM --> UC_ConfigTimeSlots
    RM --> UC_ViewCurrentMenu

    TO --> UC_Login
    TO --> UC_Logout
    TO --> UC_UpdateToken
    TO --> UC_ViewToken
    TO --> UC_AnnounceToken

    DS --> UC_ViewGallery
    DS --> UC_AutoMenuSwitch
    DS --> UC_ViewToken

    UC_CreateItem -.->|triggers| UC_AutoLog
    UC_EditItem -.->|triggers| UC_AutoLog
    UC_DeleteItem -.->|triggers| UC_AutoLog
    UC_CreateMenu -.->|triggers| UC_AutoLog
    UC_EditMenu -.->|triggers| UC_AutoLog
    UC_DeleteMenu -.->|triggers| UC_AutoLog
    UC_CreateScreen -.->|triggers| UC_AutoLog
    UC_EditScreen -.->|triggers| UC_AutoLog
    UC_DeleteScreen -.->|triggers| UC_AutoLog
    UC_UpdateToken -.->|triggers| UC_AutoLog
```

---

## 2. Activity Diagrams

### 2.1 User Authentication Flow

```mermaid
flowchart TD
    Start([User opens application]) --> CheckAuth{Has valid<br/>JWT token?}

    CheckAuth -->|Yes| ValidateToken[Verify token with server]
    CheckAuth -->|No| ShowLogin[Show Login Page]

    ValidateToken --> TokenValid{Token valid?}
    TokenValid -->|Yes| LoadDashboard[Load Dashboard]
    TokenValid -->|No, expired| ShowLogin

    ShowLogin --> EnterCreds[User enters<br/>username + password]
    EnterCreds --> SubmitLogin[Submit to POST /api/auth/login]
    SubmitLogin --> AuthResult{Credentials<br/>valid?}

    AuthResult -->|No| ShowError[Show error message]
    ShowError --> EnterCreds

    AuthResult -->|Yes| CheckActive{Account<br/>active?}
    CheckActive -->|No| ShowDisabled[Show 'Account disabled'<br/>Contact admin]
    ShowDisabled --> End1([End])

    CheckActive -->|Yes| ReceiveJWT[Receive JWT + User object]
    ReceiveJWT --> StoreToken[Store JWT in localStorage]
    StoreToken --> DetermineRole{User role?}

    DetermineRole -->|admin| AdminDash[Admin Dashboard<br/>Full access]
    DetermineRole -->|restaurant_user| ManagerDash[Manager Dashboard<br/>Items, Menus, Screens]
    DetermineRole -->|token_operator| TokenDash[Token Management<br/>Page]

    AdminDash --> End2([End])
    ManagerDash --> End2
    TokenDash --> End2

    LoadDashboard --> DetermineRole
```

### 2.2 Complete Menu Setup Workflow

Shows the end-to-end process of setting up a functioning display from scratch.

```mermaid
flowchart TD
    Start([Manager logs in]) --> Step1

    subgraph Step1["Step 1: Create Food Items"]
        CreateItem[Navigate to Items page] --> FillItem[Fill item details:<br/>name, description, price,<br/>ingredients]
        FillItem --> UploadImg[Upload food image]
        UploadImg --> UploadS3[Image uploaded to S3<br/>CDN URL returned]
        UploadS3 --> SaveItem[Save item to database]
        SaveItem --> MoreItems{More items<br/>to add?}
        MoreItems -->|Yes| FillItem
        MoreItems -->|No| ItemsDone[Items ready]
    end

    ItemsDone --> Step2

    subgraph Step2["Step 2: Create Menus"]
        CreateMenu[Navigate to Menus page] --> FillMenu[Enter menu title<br/>and description]
        FillMenu --> SelectItems[Select items<br/>for this menu]
        SelectItems --> SaveMenu[Save menu to database]
        SaveMenu --> MoreMenus{More menus?<br/>e.g., Breakfast,<br/>Lunch, Dinner}
        MoreMenus -->|Yes| FillMenu
        MoreMenus -->|No| MenusDone[Menus ready]
    end

    MenusDone --> Step3

    subgraph Step3["Step 3: Configure Display Screen"]
        CreateScreen[Navigate to Screens page] --> FillScreen[Enter screen title<br/>and screen ID slug]
        FillScreen --> SetBg[Upload background<br/>image or video]
        SetBg --> SetDefault[Set default menu<br/>fallback]
        SetDefault --> ConfigSlots[Configure time slots]

        ConfigSlots --> AddSlot[Add time slot:<br/>start time, end time,<br/>days of week, menu]
        AddSlot --> ValidateSlot{Time slot<br/>overlaps?}
        ValidateSlot -->|Yes| ShowOverlapError[Show overlap warning]
        ShowOverlapError --> AddSlot
        ValidateSlot -->|No| SlotAdded[Slot added]
        SlotAdded --> MoreSlots{More time<br/>slots?}
        MoreSlots -->|Yes| AddSlot
        MoreSlots -->|No| ConfigSettings[Configure display settings:<br/>layout, prices, ingredients]
    end

    ConfigSettings --> SaveScreen[Save screen]
    SaveScreen --> Step4

    subgraph Step4["Step 4: View Display"]
        OpenGallery[Open Gallery page] --> SelectScreen[Select screen to preview]
        SelectScreen --> FullScreen[Full-screen 16:9 display<br/>opens in browser]
        FullScreen --> AutoResolve[System resolves current<br/>menu based on time]
        AutoResolve --> ShowMenu[Display shows correct<br/>menu with items]
    end

    ShowMenu --> Done([Setup Complete<br/>Screen auto-updates every 60s])
```

### 2.3 Display Screen Time-Based Resolution (Option A: WebSocket)

The core business logic that runs on every display screen load, with WebSocket for instant push updates.

```mermaid
flowchart TD
    Start([Display screen<br/>loads or refreshes]) --> FetchScreen[GET /api/display/:screenId]
    FetchScreen --> ScreenFound{Screen<br/>exists?}

    ScreenFound -->|No| ShowNotFound[Show 'Screen not found']
    ShowNotFound --> End1([End])

    ScreenFound -->|Yes| GetTime[Get current time<br/>and day of week]
    GetTime --> HasSlots{Screen has<br/>time slots?}

    HasSlots -->|No| UseDefault{Has default<br/>menu?}
    HasSlots -->|Yes| FilterDays[Filter time slots<br/>by current day of week]

    FilterDays --> MatchingDays{Any slots match<br/>current day?}
    MatchingDays -->|No| UseDefault
    MatchingDays -->|Yes| FilterTime[Filter remaining slots<br/>by current time range]

    FilterTime --> MatchingTime{Any slot contains<br/>current time?}
    MatchingTime -->|No| UseDefault
    MatchingTime -->|Yes| LoadSlotMenu[Load matched slot's menu<br/>and populate items]

    UseDefault -->|Yes| LoadDefaultMenu[Load default menu<br/>and populate items]
    UseDefault -->|No| ShowNoMenu[Show 'No menu available<br/>at this time']

    LoadSlotMenu --> FilterActive[Filter out<br/>inactive items]
    LoadDefaultMenu --> FilterActive

    FilterActive --> RenderDisplay[Render menu display<br/>with screen settings:<br/>layout, background,<br/>prices, ingredients]

    RenderDisplay --> SetTimer[Set 60-second<br/>auto-refresh timer]
    SetTimer --> ConnectWS[Connect to WebSocket<br/>room screen:screenId]
    ConnectWS --> WaitForUpdate[Wait for update event<br/>or timer expiry]

    WaitForUpdate -->|Timer expires| FetchScreen
    WaitForUpdate -->|menu:updated event| UpdateInPlace[Update displayed<br/>menu immediately]
    WaitForUpdate -->|screen:updated event| ReloadScreen[Reload screen<br/>configuration]

    UpdateInPlace --> WaitForUpdate
    ReloadScreen --> GetTime

    ShowNoMenu --> SetTimer
    ShowNotFound --> End1
```

### 2.4 Display Screen Time-Based Resolution (Option B: Short Polling)

Same core time resolution logic, but using periodic HTTP polling instead of WebSocket.

```mermaid
flowchart TD
    Start([Display screen loads]) --> InitFetch[GET /api/display/:screenId]
    InitFetch --> ScreenFound{Screen<br/>exists?}

    ScreenFound -->|No| ShowNotFound[Show 'Screen not found']
    ShowNotFound --> End1([End])

    ScreenFound -->|Yes| StoreETag[Store response ETag<br/>for conditional requests]
    StoreETag --> ResolveMenu[Server resolves current menu<br/>based on time + day]
    ResolveMenu --> RenderDisplay[Render menu display]

    RenderDisplay --> StartPolling[Start polling intervals]

    StartPolling --> MenuPoll["Start 30-second interval:<br/>Poll GET /api/display/:screenId<br/>with If-None-Match: ETag"]
    StartPolling --> TokenPoll["Start 5-second interval:<br/>Poll GET /api/token"]

    MenuPoll --> MenuPollResult{Response<br/>status?}
    MenuPollResult -->|304 Not Modified| MenuNoChange[No change — skip re-render]
    MenuPollResult -->|200 OK| MenuChanged[Data changed — update<br/>ETag and re-render display]
    MenuPollResult -->|Network error| MenuRetry[Log error, retry<br/>on next interval]

    MenuNoChange --> MenuPoll
    MenuChanged --> RenderDisplay
    MenuRetry --> MenuPoll

    TokenPoll --> TokenResult{Token<br/>changed?}
    TokenResult -->|No| TokenPoll
    TokenResult -->|Yes| UpdateToken[Update token display]
    UpdateToken --> AnnounceVoice[Voice: 'Now serving<br/>token number X']
    AnnounceVoice --> TokenPoll

    style MenuPoll fill:#e1f5fe
    style TokenPoll fill:#fff3e0
```

### 2.5 Token Management Workflow

```mermaid
flowchart TD
    Start([Token Operator<br/>logs in]) --> NavigateToken[Navigate to<br/>Token Management page]

    NavigateToken --> ViewCurrent[View current token<br/>and last 3 history]
    ViewCurrent --> EnterToken[Enter new<br/>token number]
    EnterToken --> ValidateInput{Valid<br/>number?}

    ValidateInput -->|No| ShowError[Show validation error]
    ShowError --> EnterToken

    ValidateInput -->|Yes| SubmitToken[PUT /api/token<br/>Update token number]
    SubmitToken --> ServerUpdate[Server updates<br/>TokenState document]
    ServerUpdate --> LogActivity[Auto-log: Token updated<br/>by operator]

    LogActivity --> EmitSocket[Server emits<br/>token:updated event<br/>to 'token' room]

    EmitSocket --> NotifyDisplays[All connected display<br/>screens receive update]
    EmitSocket --> UpdateUI[Operator's UI<br/>updates with new token]

    NotifyDisplays --> DisplayShowToken[Display screens<br/>show new token number]
    DisplayShowToken --> VoiceAnnounce[Text-to-speech:<br/>'Now serving<br/>token number X']

    UpdateUI --> UpdateHistory[Token history<br/>shifts: new token added,<br/>oldest removed if > 3]
    UpdateHistory --> ReadyForNext[Ready for next<br/>token update]
    ReadyForNext --> EnterToken

    VoiceAnnounce --> DisplayWait[Display waits for<br/>next token event]
    DisplayWait --> NotifyDisplays
```

---

## 3. Sequence Diagrams

### 3.1 User Login

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant API as Express API Server
    participant DB as MongoDB

    User->>Frontend: Enter username + password
    Frontend->>API: POST /api/auth/login<br/>{username, password}

    API->>DB: Find user by username
    DB-->>API: User document (with passwordHash)

    alt User not found
        API-->>Frontend: 401 {error: "Invalid credentials"}
        Frontend-->>User: Show error message
    else User found
        API->>API: bcrypt.compare(password, passwordHash)
        alt Password incorrect
            API-->>Frontend: 401 {error: "Invalid credentials"}
            Frontend-->>User: Show error message
        else Password correct
            alt Account disabled
                API-->>Frontend: 403 {error: "Account disabled"}
                Frontend-->>User: Show disabled message
            else Account active
                API->>API: Generate JWT<br/>{userId, role, exp: 7d}
                API-->>Frontend: 200 {token, user: {id, name, role}}
                Frontend->>Frontend: Store JWT in localStorage
                Frontend-->>User: Redirect to Dashboard
            end
        end
    end
```

### 3.2 Create Item with Image Upload

```mermaid
sequenceDiagram
    actor Manager
    participant Frontend as React Frontend
    participant API as Express API Server
    participant S3 as AWS S3
    participant CDN as CloudFront CDN
    participant DB as MongoDB
    participant Socket as Socket.IO

    Manager->>Frontend: Fill item form<br/>(name, price, description)
    Manager->>Frontend: Select image file

    Frontend->>API: POST /api/upload<br/>(multipart/form-data)
    API->>API: Validate file type + size<br/>(JPEG/PNG/WebP, max 5MB)
    API->>S3: Upload to items/{uuid}.jpg
    S3-->>API: S3 key confirmed
    API-->>Frontend: 200 {url: "https://cdn.../items/abc.jpg"}

    Frontend->>Frontend: Set imageUrl in form state

    Manager->>Frontend: Click "Save Item"
    Frontend->>API: POST /api/items<br/>{name, price, description,<br/>ingredients, imageUrl}
    Note over API: Auth middleware verifies JWT
    Note over API: Authorize middleware checks role
    Note over API: Validate middleware checks schema

    API->>DB: Create Item document
    DB-->>API: Saved item with _id

    API->>DB: Create ActivityLog entry<br/>{action: CREATE, resource: item}

    API-->>Frontend: 201 {data: item}
    Frontend-->>Manager: Show success toast<br/>"Item created successfully"
    Frontend->>Frontend: Update items list in UI
```

### 3.3A Display Screen Loading — WebSocket Variant

```mermaid
sequenceDiagram
    participant TV as Display Screen (TV)
    participant API as Express API Server
    participant Socket as Socket.IO Server
    participant DB as MongoDB
    participant CDN as CloudFront CDN
    actor Manager

    Note over TV: TV opens /gallery/main-hall

    TV->>API: GET /api/display/main-hall
    API->>DB: Find Screen by screenId="main-hall"
    DB-->>API: Screen document
    API->>API: Resolve current menu<br/>(check time slots vs current time)
    API->>DB: Populate menu items
    DB-->>API: Menu + Items data
    API-->>TV: 200 {screen, currentMenu, items}

    TV->>CDN: Fetch background image
    CDN-->>TV: Background media
    TV->>CDN: Fetch item images
    CDN-->>TV: Item images
    TV->>TV: Render full-screen display

    TV->>Socket: Connect WebSocket
    TV->>Socket: Emit screen:join {screenId: "main-hall"}
    Socket->>Socket: Add to room "screen:main-hall"
    Socket->>Socket: Add to room "token"

    Note over TV: Display is live, waiting for updates

    rect rgb(255, 245, 230)
        Note over Manager, Socket: Later: Manager updates an item's price
        Manager->>API: PUT /api/items/:id {price: 200}
        API->>DB: Update item
        API->>DB: Log activity
        API->>DB: Find menus containing this item
        API->>DB: Find screens referencing those menus
        API->>API: Resolve current menu for each affected screen
        API->>Socket: Emit menu:updated to room "screen:main-hall"
        Socket-->>TV: menu:updated {screenId, menu, items}
        TV->>TV: Update display in-place<br/>(no full page reload)
    end
```

### 3.3B Display Screen Loading — Short Polling Variant

```mermaid
sequenceDiagram
    participant TV as Display Screen (TV)
    participant API as Express API Server
    participant DB as MongoDB
    participant CDN as CloudFront CDN
    actor Manager

    Note over TV: TV opens /gallery/main-hall

    TV->>API: GET /api/display/main-hall
    API->>DB: Find Screen + resolve menu
    DB-->>API: Screen + Menu + Items
    API-->>TV: 200 {screen, currentMenu, items}<br/>ETag: "v1-abc123"

    TV->>CDN: Fetch images
    CDN-->>TV: Media files
    TV->>TV: Render full-screen display
    TV->>TV: Store ETag "v1-abc123"
    TV->>TV: Start 30s menu poll interval
    TV->>TV: Start 5s token poll interval

    Note over TV: Display is live, polling for updates

    rect rgb(240, 248, 255)
        Note over TV, API: 30 seconds later: Menu poll (no changes)
        TV->>API: GET /api/display/main-hall<br/>If-None-Match: "v1-abc123"
        API->>API: Compare ETag — no change
        API-->>TV: 304 Not Modified
        TV->>TV: Skip re-render (no change)
    end

    rect rgb(255, 245, 230)
        Note over Manager, API: Manager updates an item's price
        Manager->>API: PUT /api/items/:id {price: 200}
        API->>DB: Update item + log activity
    end

    rect rgb(240, 255, 240)
        Note over TV, API: 30 seconds later: Menu poll (change detected)
        TV->>API: GET /api/display/main-hall<br/>If-None-Match: "v1-abc123"
        API->>DB: Resolve menu (item price changed)
        API-->>TV: 200 {screen, currentMenu, items}<br/>ETag: "v2-def456"
        TV->>TV: Data differs — re-render display<br/>with updated price
        TV->>TV: Store new ETag "v2-def456"
    end

    rect rgb(255, 248, 240)
        Note over TV, API: 5-second token poll cycle
        TV->>API: GET /api/token
        API-->>TV: 200 {currentToken: 41, history}
        TV->>TV: Same token — no change

        Note over TV, API: 5 seconds later
        TV->>API: GET /api/token
        API-->>TV: 200 {currentToken: 42, history}
        TV->>TV: Token changed! Update display
        TV->>TV: speak("Now serving token 42")
    end
```

### 3.4A Token Update — WebSocket Variant

```mermaid
sequenceDiagram
    actor Operator as Token Operator
    participant Frontend as Operator's Browser
    participant API as Express API Server
    participant DB as MongoDB
    participant Socket as Socket.IO Server
    participant TV as Display Screen (TV)
    participant Speech as Web Speech API

    Operator->>Frontend: Enter token number: 42
    Frontend->>API: PUT /api/token<br/>{number: 42}

    Note over API: Auth middleware: verify JWT
    Note over API: Authorize: token_operator or admin

    API->>DB: Update TokenState document<br/>(push to history, keep last 3)
    DB-->>API: Updated token state
    API->>DB: Log activity: "Token updated to 42"

    API->>Socket: Emit token:updated to "token" room<br/>{currentToken: 42, history: [...]}
    API-->>Frontend: 200 {currentToken: 42, history}

    Frontend-->>Operator: UI updates with new token

    Socket-->>TV: token:updated<br/>{currentToken: 42, history}
    TV->>TV: Display token number 42
    TV->>Speech: speak("Now serving token number 42")
    Speech-->>TV: Voice announcement plays

    Note over TV: Display shows token 42<br/>with last 3 history entries
```

### 3.4B Token Update — Short Polling Variant

```mermaid
sequenceDiagram
    actor Operator as Token Operator
    participant Frontend as Operator's Browser
    participant API as Express API Server
    participant DB as MongoDB
    participant TV as Display Screen (TV)
    participant Speech as Web Speech API

    Operator->>Frontend: Enter token number: 42
    Frontend->>API: PUT /api/token<br/>{number: 42}

    Note over API: Auth + Authorize

    API->>DB: Update TokenState document
    DB-->>API: Updated token state
    API->>DB: Log activity
    API-->>Frontend: 200 {currentToken: 42, history}
    Frontend-->>Operator: UI updates immediately

    Note over TV: TV is polling GET /api/token every 5 seconds

    rect rgb(255, 248, 240)
        Note over TV, API: Within 5 seconds: next token poll fires
        TV->>API: GET /api/token
        API->>DB: Read TokenState
        DB-->>API: {currentToken: 42, history}
        API-->>TV: 200 {currentToken: 42, history}
        TV->>TV: Compare with previous: 41 → 42<br/>Token changed!
        TV->>TV: Display token number 42
        TV->>Speech: speak("Now serving token number 42")
        Speech-->>TV: Voice announcement plays
    end

    Note over TV: Max 5-second delay between<br/>operator update and TV display
```

---

## 4. State Machine Diagrams

### 4.1A Display Screen States (Option A: WebSocket)

```mermaid
stateDiagram-v2
    [*] --> Loading: Browser opens /gallery/:screenId

    Loading --> ScreenNotFound: Screen ID not in database
    Loading --> ResolvingMenu: Screen found

    ScreenNotFound --> [*]: Show error page

    ResolvingMenu --> ShowingMenu: Time slot match found
    ResolvingMenu --> ShowingDefaultMenu: No slot match,<br/>default menu exists
    ResolvingMenu --> NoMenuAvailable: No slot match,<br/>no default menu

    ShowingMenu --> ConnectedRealtime: WebSocket connected
    ShowingDefaultMenu --> ConnectedRealtime: WebSocket connected
    NoMenuAvailable --> ConnectedRealtime: WebSocket connected

    state ConnectedRealtime {
        [*] --> Idle

        Idle --> UpdatingMenu: menu:updated event received
        Idle --> UpdatingScreen: screen:updated event received
        Idle --> UpdatingToken: token:updated event received
        Idle --> AutoRefreshing: 60-second timer fires

        UpdatingMenu --> Idle: Menu re-rendered
        UpdatingScreen --> ResolvingMenu: Screen config changed,<br/>re-resolve menu
        UpdatingToken --> Idle: Token displayed +<br/>voice announced
        AutoRefreshing --> ResolvingMenu: Re-fetch and resolve
    }

    ConnectedRealtime --> Disconnected: Network error

    Disconnected --> Reconnecting: Auto-reconnect attempt
    Reconnecting --> ConnectedRealtime: Reconnected
    Reconnecting --> Disconnected: Reconnect failed<br/>(retry with backoff)
```

### 4.1B Display Screen States (Option B: Short Polling)

```mermaid
stateDiagram-v2
    [*] --> Loading: Browser opens /gallery/:screenId

    Loading --> ScreenNotFound: Screen ID not in database
    Loading --> ResolvingMenu: Screen found

    ScreenNotFound --> [*]: Show error page

    ResolvingMenu --> DisplayActive: Menu resolved and rendered
    ResolvingMenu --> NoMenuAvailable: No slot match,<br/>no default menu

    NoMenuAvailable --> DisplayActive: Continue polling

    state DisplayActive {
        [*] --> Displaying

        state Displaying {
            [*] --> WaitingForPoll

            WaitingForPoll --> MenuPolling: 30-second menu timer fires
            WaitingForPoll --> TokenPolling: 5-second token timer fires

            MenuPolling --> ComparingMenu: Response received
            ComparingMenu --> WaitingForPoll: 304 Not Modified<br/>(no change)
            ComparingMenu --> ReRendering: 200 OK<br/>(data changed)
            ReRendering --> WaitingForPoll: Display updated

            TokenPolling --> ComparingToken: Response received
            ComparingToken --> WaitingForPoll: Token unchanged
            ComparingToken --> AnnouncingToken: Token changed
            AnnouncingToken --> WaitingForPoll: Display + voice updated
        }
    }

    DisplayActive --> NetworkError: Fetch fails
    NetworkError --> DisplayActive: Next poll interval<br/>(auto-retry)

    note right of DisplayActive : No persistent connection<br/>No reconnection logic needed<br/>Each poll is independent
```

### 4.2 User Session Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated: App loaded

    Unauthenticated --> Authenticating: Submit login form

    Authenticating --> Authenticated: Valid credentials +<br/>active account
    Authenticating --> LoginFailed: Invalid credentials
    Authenticating --> AccountDisabled: Valid credentials but<br/>account deactivated

    LoginFailed --> Unauthenticated: Show error, return to form
    AccountDisabled --> Unauthenticated: Show disabled message

    state Authenticated {
        [*] --> ActiveSession

        state ActiveSession {
            [*] --> Browsing
            Browsing --> PerformingAction: CRUD operation
            PerformingAction --> Browsing: Action complete
            PerformingAction --> ActionFailed: Error (validation,<br/>ref integrity)
            ActionFailed --> Browsing: Show error toast
        }
    }

    Authenticated --> TokenExpired: JWT expires (7 days)
    Authenticated --> LoggedOut: User clicks logout

    TokenExpired --> Unauthenticated: Clear token, redirect to login
    LoggedOut --> Unauthenticated: Clear token, redirect to login
```

### 4.3 Food Item Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft: Manager fills item form

    Draft --> ImageUploading: Upload image selected
    ImageUploading --> Draft: Upload failed (retry)
    ImageUploading --> ReadyToSave: Image URL received from S3

    Draft --> ReadyToSave: No image (optional)

    ReadyToSave --> Active: Save item<br/>(isActive = true)

    Active --> Active: Item updated<br/>(price, description, image)
    Active --> Inactive: Deactivated by admin<br/>(isActive = false)
    Active --> DeletionBlocked: Delete attempted but<br/>used in menu(s)

    Inactive --> Active: Reactivated<br/>(isActive = true)
    Inactive --> Deleted: Deleted<br/>(not in any menu)

    DeletionBlocked --> Active: Show error:<br/>"Used in Menu X, Y"

    Active --> Deleted: Deleted<br/>(not in any menu)

    Deleted --> [*]

    note right of Active: Active items appear<br/>in menu displays
    note right of Inactive: Inactive items hidden<br/>from displays but<br/>still in menus
```

---

## 5. Component Diagram

### 5A. Component Diagram — WebSocket Architecture

```mermaid
graph TB
    subgraph Client_Layer["Client Layer"]
        subgraph Admin_UI["Admin/Manager Web App (React)"]
            AuthModule["Auth Module<br/>(Login, JWT Storage)"]
            ItemMgmt["Item Management<br/>UI"]
            MenuMgmt["Menu Management<br/>UI"]
            ScreenMgmt["Screen Management<br/>UI"]
            TokenMgmt["Token Management<br/>UI"]
            LogViewer["Activity Log Viewer<br/>(Admin only)"]
            APIClient["API Client Layer<br/>(Axios/Fetch + JWT)"]
            WSClient["WebSocket Client<br/>(Socket.IO Client)"]
        end

        subgraph Display_UI["Display Screen App (React)"]
            GalleryView["Gallery Display<br/>(Full-screen 16:9)"]
            TimeRenderer["Time-Based Renderer"]
            TokenDisplay["Token Display<br/>+ Voice Announce"]
            WSDisplay["WebSocket Client<br/>(Real-time updates)"]
        end
    end

    subgraph Server_Layer["Server Layer (Express.js)"]
        subgraph Middleware["Middleware Chain"]
            JWTAuth["JWT Auth<br/>Middleware"]
            RoleAuth["Role Authorization<br/>Middleware"]
            Validator["Request Validation<br/>Middleware"]
            ErrorHandler["Global Error<br/>Handler"]
        end

        subgraph Services["Service Layer"]
            AuthService["Auth Service<br/>(Login, JWT, bcrypt)"]
            UserService["User Service"]
            ItemService["Item Service"]
            MenuService["Menu Service"]
            ScreenService["Screen Service"]
            DisplayService["Display Service<br/>(Time Resolution)"]
            TokenService["Token Service"]
            UploadService["Upload Service<br/>(S3 Operations)"]
            LogService["Activity Log Service"]
        end

        subgraph Realtime["Real-Time Layer"]
            SocketServer["Socket.IO Server"]
            RoomManager["Room Manager<br/>(screen rooms, token room)"]
            EventEmitter["Event Emitter<br/>(menu:updated,<br/>screen:updated,<br/>token:updated)"]
        end

        RESTRouter["REST API Router"]
    end

    subgraph Data_Layer["Data & Storage Layer"]
        MongoDB[("MongoDB Atlas<br/>(Users, Items, Menus,<br/>Screens, Logs, Tokens)")]
        S3[("AWS S3<br/>(Images, Videos)")]
        CloudFront["CloudFront CDN<br/>(Media delivery)"]
    end

    %% Client to Server connections
    APIClient -->|HTTPS REST| RESTRouter
    WSClient -->|WebSocket| SocketServer
    WSDisplay -->|WebSocket| SocketServer

    %% Server internal flow
    RESTRouter --> Middleware
    Middleware --> Services

    %% Services to data
    AuthService --> MongoDB
    UserService --> MongoDB
    ItemService --> MongoDB
    MenuService --> MongoDB
    ScreenService --> MongoDB
    DisplayService --> MongoDB
    TokenService --> MongoDB
    LogService --> MongoDB
    UploadService --> S3

    %% Services to real-time
    ItemService -->|notify| EventEmitter
    MenuService -->|notify| EventEmitter
    ScreenService -->|notify| EventEmitter
    TokenService -->|notify| EventEmitter

    EventEmitter --> RoomManager
    RoomManager --> SocketServer

    %% Media delivery
    S3 --> CloudFront
    CloudFront -->|CDN URLs| Admin_UI
    CloudFront -->|CDN URLs| Display_UI
```

### 5B. Component Diagram — Short Polling Architecture

Note the key differences: no Socket.IO layer on server, no WebSocket clients. Display screens use polling hooks instead.

```mermaid
graph TB
    subgraph Client_Layer["Client Layer"]
        subgraph Admin_UI["Admin/Manager Web App (React)"]
            AuthModule["Auth Module<br/>(Login, JWT Storage)"]
            ItemMgmt["Item Management<br/>UI"]
            MenuMgmt["Menu Management<br/>UI"]
            ScreenMgmt["Screen Management<br/>UI"]
            TokenMgmt["Token Management<br/>UI"]
            LogViewer["Activity Log Viewer<br/>(Admin only)"]
            APIClient2["API Client Layer<br/>(Axios/Fetch + JWT)"]
        end

        subgraph Display_UI2["Display Screen App (React)"]
            GalleryView2["Gallery Display<br/>(Full-screen 16:9)"]
            TimeRenderer2["Time-Based Renderer"]
            TokenDisplay2["Token Display<br/>+ Voice Announce"]
            PollingHook["usePolling Hook<br/>(30s menu, 5s token)"]
            ETagCache["ETag Cache<br/>(conditional requests)"]
        end
    end

    subgraph Server_Layer["Server Layer (Express.js)"]
        subgraph Middleware2["Middleware Chain"]
            JWTAuth2["JWT Auth<br/>Middleware"]
            RoleAuth2["Role Authorization<br/>Middleware"]
            Validator2["Request Validation<br/>Middleware"]
            ETagMiddleware["ETag / Conditional<br/>Request Middleware"]
            ErrorHandler2["Global Error<br/>Handler"]
        end

        subgraph Services2["Service Layer"]
            AuthService2["Auth Service"]
            UserService2["User Service"]
            ItemService2["Item Service"]
            MenuService2["Menu Service"]
            ScreenService2["Screen Service"]
            DisplayService2["Display Service<br/>(Time Resolution<br/>+ ETag generation)"]
            TokenService2["Token Service"]
            UploadService2["Upload Service"]
            LogService2["Activity Log Service"]
        end

        RESTRouter2["REST API Router"]

        NoSocket["No Socket.IO layer<br/>(not needed)"]
        style NoSocket fill:#f5f5f5,stroke:#ccc,stroke-dasharray: 5 5
    end

    subgraph Data_Layer2["Data & Storage Layer"]
        MongoDB2[("MongoDB Atlas")]
        S32[("AWS S3")]
        CloudFront2["CloudFront CDN"]
    end

    %% Client to Server — REST only, no WebSocket
    APIClient2 -->|HTTPS REST| RESTRouter2
    PollingHook -->|"HTTPS REST<br/>(periodic GET)"| RESTRouter2
    ETagCache -->|If-None-Match| ETagMiddleware

    %% Server internal flow
    RESTRouter2 --> Middleware2
    Middleware2 --> Services2

    %% Services to data
    AuthService2 --> MongoDB2
    UserService2 --> MongoDB2
    ItemService2 --> MongoDB2
    MenuService2 --> MongoDB2
    ScreenService2 --> MongoDB2
    DisplayService2 --> MongoDB2
    TokenService2 --> MongoDB2
    LogService2 --> MongoDB2
    UploadService2 --> S32

    %% Media delivery
    S32 --> CloudFront2
    CloudFront2 -->|CDN URLs| Admin_UI
    CloudFront2 -->|CDN URLs| Display_UI2
```

---

## 6. Entity Relationship Diagram

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String name
        String email UK
        String username UK
        String passwordHash
        String role "admin | restaurant_user | token_operator"
        Boolean isActive
        Date createdAt
        Date updatedAt
    }

    ITEM {
        ObjectId _id PK
        String name
        String description
        Number price
        String ingredients
        String imageUrl
        Boolean isActive
        Date createdAt
        Date updatedAt
    }

    MENU {
        ObjectId _id PK
        String title
        String description
        Date createdAt
        Date updatedAt
    }

    SCREEN {
        ObjectId _id PK
        String title
        String screenId UK "URL slug"
        ObjectId defaultMenu FK
        String backgroundType "image | video"
        String backgroundUrl
        String foregroundUrl
        JSON displaySettings
        Date createdAt
        Date updatedAt
    }

    TIMESLOT {
        String startTime "HH:mm"
        String endTime "HH:mm"
        ObjectId menu FK
        Array daysOfWeek
    }

    ACTIVITY_LOG {
        ObjectId _id PK
        ObjectId user FK
        String userName
        String action "CREATE | UPDATE | DELETE"
        String resourceType
        String resourceName
        String details
        JSON beforeData
        JSON afterData
        Date createdAt
    }

    TOKEN_STATE {
        ObjectId _id PK
        Number currentToken
        Date updatedAt
    }

    TOKEN_HISTORY_ENTRY {
        Number number
        Date updatedAt
    }

    USER ||--o{ ACTIVITY_LOG : "actions logged"
    MENU ||--|{ ITEM : "contains (many-to-many)"
    SCREEN ||--o| MENU : "has default menu"
    SCREEN ||--|{ TIMESLOT : "has time slots (embedded)"
    TIMESLOT ||--o| MENU : "displays menu"
    TOKEN_STATE ||--|{ TOKEN_HISTORY_ENTRY : "has history (max 3)"
```

---

## 7. Deployment Diagram

```mermaid
graph TB
    subgraph Internet["Internet"]
        Browser["Admin/Manager<br/>Browser"]
        TVBrowser["Display Screen<br/>Browser (TV)"]
    end

    subgraph Vercel["Vercel (Frontend Host)"]
        ReactApp["React SPA<br/>(Built with Vite)<br/>Static files"]
    end

    subgraph AWS["AWS Cloud"]
        subgraph VPC["Virtual Private Cloud"]
            subgraph ECS["EC2 / ECS"]
                Docker["Docker Container"]
                subgraph NodeApp["Node.js Application"]
                    Express["Express.js<br/>REST API<br/>Port 5000"]
                    SocketIO["Socket.IO<br/>WebSocket Server"]
                end
            end
        end

        subgraph Storage["Storage Services"]
            S3["S3 Bucket<br/>canteen-media-bucket<br/>/items/<br/>/screens/"]
            CloudFront["CloudFront CDN<br/>cdn.example.com"]
        end

        subgraph Database["Database"]
            MongoAtlas["MongoDB Atlas<br/>(Managed Cluster)<br/>Region: ap-south-1"]
        end
    end

    Browser -->|HTTPS| Vercel
    Browser -->|HTTPS REST| Express
    Browser -->|WSS| SocketIO

    TVBrowser -->|HTTPS| Vercel
    TVBrowser -->|HTTPS REST| Express
    TVBrowser -->|WSS| SocketIO

    Express -->|Mongoose| MongoAtlas
    Express -->|AWS SDK| S3

    S3 -->|Origin| CloudFront
    CloudFront -->|CDN| Browser
    CloudFront -->|CDN| TVBrowser

    ReactApp -->|Static assets| Browser
    ReactApp -->|Static assets| TVBrowser
```

---

## 8. Data Flow Overview

### 8A. Data Flow — WebSocket Architecture

#### 8A.1 Write Path (WebSocket push to displays)

```mermaid
flowchart LR
    A[Admin action<br/>in browser] -->|REST API| B[Express Server]
    B -->|Validate + Auth| C[Service Layer]
    C -->|Write| D[(MongoDB)]
    C -->|Upload media| E[(S3)]
    C -->|Log activity| F[(ActivityLog<br/>collection)]
    C -->|Notify| G[Socket.IO]
    G -->|Push to rooms| H[Display Screens]
```

#### 8A.2 Read Path (WebSocket — display loads then listens)

```mermaid
flowchart LR
    A[TV Browser] -->|GET /display/:screenId| B[Express Server]
    B -->|Resolve time slots| C[Display Service]
    C -->|Query| D[(MongoDB)]
    D -->|Screen + Menu + Items| C
    C -->|Resolved menu| B
    B -->|JSON response| A
    A -->|Fetch images| E[CloudFront CDN]
    E -->|Images| A
    A -->|Connect| F[Socket.IO]
    F -->|Join room| A
```

### 8B. Data Flow — Short Polling Architecture

#### 8B.1 Write Path (Polling — no push, displays poll next cycle)

```mermaid
flowchart LR
    A[Admin action<br/>in browser] -->|REST API| B[Express Server]
    B -->|Validate + Auth| C[Service Layer]
    C -->|Write| D[(MongoDB)]
    C -->|Upload media| E[(S3)]
    C -->|Log activity| F[(ActivityLog<br/>collection)]

    H[Display Screens] -.->|"Poll every 30s<br/>(picks up change)"| B
```

#### 8B.2 Read Path (Polling — periodic fetch with ETag optimization)

```mermaid
flowchart LR
    A[TV Browser] -->|"GET /display/:screenId<br/>(every 30s)"| B[Express Server]
    B -->|Check ETag| C{Data changed?}
    C -->|No| D["304 Not Modified<br/>(no body, fast)"]
    C -->|Yes| E[Resolve time slots]
    E -->|Query| F[(MongoDB)]
    F -->|Screen + Menu + Items| E
    E -->|"200 + new ETag"| A
    A -->|Fetch images| G[CloudFront CDN]
    G -->|Images| A

    A2[TV Browser] -->|"GET /api/token<br/>(every 5s)"| B2[Express Server]
    B2 -->|Read| H[(MongoDB)]
    H -->|Token state| B2
    B2 -->|JSON| A2
```

---

## Diagram Export Guide

To convert these Mermaid diagrams to PNG/SVG for client presentations:

**Option 1: mermaid-cli (recommended)**
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i docs/plans/2026-02-20-system-uml-diagrams.md -o docs/diagrams/ -e png
```

**Option 2: Online tools**
- Paste diagrams into [Mermaid Live Editor](https://mermaid.live/)
- Export as PNG or SVG

**Option 3: GitHub rendering**
- Push this file to GitHub — Mermaid diagrams render automatically in markdown preview
