import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { LayoutGroup, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { ArrowDown, Info, Menu, X } from 'lucide-react';
import '@fontsource-variable/manrope';
import { useChat } from '../shared/chat';
import { Answer, Composer, ConversationList, DemoInfo, FileItem, spring } from './ChatParts';

export default function App() {
  const chat = useChat();
  const reduced = useReducedMotion();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [hasMoreToRead, setHasMoreToRead] = useState(false);
  const navigationRef = useRef<HTMLElement>(null);
  const navigationTrigger = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDialogElement>(null);
  const follow = useRef(false);
  const previousConversation = useRef(chat.activeId);
  // Reading offsets are presentation state; conversation data stays in useChat.
  const readingPositions = useRef(new Map<string, number>());
  const hasMessages = chat.messages.length > 0;
  const lastMessage = chat.messages.at(-1);

  function closeNavigation(restoreFocus = true) {
    setNavigationOpen(false);
    if (restoreFocus) navigationTrigger.current?.focus({ preventScroll: true });
  }
  function selectConversation(id: string) {
    if (scrollRef.current) readingPositions.current.set(chat.activeId, scrollRef.current.scrollTop);
    chat.selectChat(id);
    closeNavigation(false);
    requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
  }
  function newConversation() {
    if (scrollRef.current) readingPositions.current.set(chat.activeId, scrollRef.current.scrollTop);
    chat.newChat();
    closeNavigation(false);
    requestAnimationFrame(() => textareaRef.current?.focus({ preventScroll: true }));
  }
  function send() {
    follow.current = true;
    chat.send();
    textareaRef.current?.focus({ preventScroll: true });
  }

  const measureReading = useCallback(() => {
    const scroller = scrollRef.current;
    if (scroller) setHasMoreToRead(scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight > 4);
  }, []);

  function readOn() {
    const scroller = scrollRef.current;
    if (!scroller) return;
    follow.current = false;
    // Keep an overlapping passage for orientation, and leave focus on a stable
    // keyboard-scrollable region if the action disappears at the answer's end.
    scroller.focus({ preventScroll: true });
    scroller.scrollTop += scroller.clientHeight * 0.8;
    measureReading();
  }
  function retry() {
    follow.current = true;
    chat.retry();
    textareaRef.current?.focus({ preventScroll: true });
  }

  useEffect(() => {
    const guardFiles = (event: DragEvent) => { if (event.dataTransfer?.types.includes('Files')) event.preventDefault(); };
    window.addEventListener('dragover', guardFiles);
    window.addEventListener('drop', guardFiles);
    const viewport = () => document.documentElement.style.setProperty('--viewport-height', `${window.visualViewport?.height || window.innerHeight}px`);
    viewport();
    window.visualViewport?.addEventListener('resize', viewport);
    window.addEventListener('resize', viewport);
    return () => {
      window.removeEventListener('dragover', guardFiles);
      window.removeEventListener('drop', guardFiles);
      window.visualViewport?.removeEventListener('resize', viewport);
      window.removeEventListener('resize', viewport);
    };
  }, []);

  useEffect(() => {
    if (!navigationOpen) return;
    // Opening history should not summon the software keyboard.
    navigationRef.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); closeNavigation(); } };
    const outside = (event: PointerEvent) => {
      // Restore focus when the click lands on plain content. Native pointer
      // focus may then move it to the outside control the person actually chose.
      if (!navigationRef.current?.contains(event.target as Node) && !navigationTrigger.current?.contains(event.target as Node)) closeNavigation();
    };
    const resize = () => {
      if (!window.matchMedia('(min-width: 768px)').matches) return;
      const focusWasInNavigation = navigationRef.current?.contains(document.activeElement) || document.activeElement === navigationTrigger.current;
      closeNavigation(false);
      // The mobile trigger also disappears at this breakpoint.
      if (focusWasInNavigation) document.getElementById('main-content')?.focus({ preventScroll: true });
    };
    const focusOutside = (event: FocusEvent) => {
      if (!navigationRef.current?.contains(event.target as Node) && !navigationTrigger.current?.contains(event.target as Node)) closeNavigation(false);
    };
    document.addEventListener('keydown', escape);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', focusOutside);
    window.addEventListener('resize', resize);
    return () => {
      document.removeEventListener('keydown', escape);
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', focusOutside);
      window.removeEventListener('resize', resize);
    };
  }, [navigationOpen]);

  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    if (previousConversation.current !== chat.activeId) {
      previousConversation.current = chat.activeId;
      follow.current = false;
      scroller.scrollTop = readingPositions.current.get(chat.activeId) ?? 0;
    } else if (follow.current) {
      scroller.scrollTop = scroller.scrollHeight;
    }
    measureReading();
  }, [chat.messages, chat.tools, chat.activeId, measureReading]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const observer = new ResizeObserver(() => {
      // Font loading, multiline drafts, attachments and the software keyboard
      // all change clearance. Only readers already following stay at the end.
      if (follow.current) scroller.scrollTop = scroller.scrollHeight;
      measureReading();
    });
    observer.observe(scroller);
    if (scroller.firstElementChild) observer.observe(scroller.firstElementChild);
    return () => observer.disconnect();
  }, [measureReading]);

  const activeStep = chat.tools.find(step => step.status === 'running');
  const status = chat.busy ? activeStep ? `${activeStep.label}. In progress.` : 'Folio is writing a response.' : lastMessage?.status === 'complete' ? 'Response complete.' : lastMessage?.status === 'stopped' ? 'Response stopped.' : '';

  return <MotionConfig reducedMotion="user" transition={spring}>
    <LayoutGroup>
      <a className="skip-link" href="#main-content">Skip to conversation</a>
      <div className="app-shell flex bg-canvas text-ink">
        <aside className="desktop-sidebar hidden shrink-0 flex-col md:flex" aria-label="Conversation history">
          <div className="wordmark mb-10 px-3">folio<span className="text-accent">.</span></div>
          <ConversationList conversations={chat.conversations} activeId={chat.activeId} selectChat={selectConversation} newChat={newConversation} />
          <button className="button mt-6 flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-muted hover:bg-surface hover:text-ink" onClick={() => demoRef.current?.showModal()}><Info size={18} aria-hidden="true" />About this demo</button>
        </aside>
        <main id="main-content" tabIndex={-1} className={`workspace flex min-w-0 flex-1 flex-col ${hasMessages ? 'has-messages' : 'is-empty'}`}>
          <header className="workspace-header reading-width flex shrink-0 items-center gap-3">
            <button ref={navigationTrigger} className="icon-button -ml-2 shrink-0 md:hidden" aria-label="Open conversations" aria-expanded={navigationOpen} aria-controls="mobile-conversations" onClick={() => setNavigationOpen(!navigationOpen)}><Menu size={21} aria-hidden="true" /></button>
            {!hasMessages && <span aria-hidden="true" className="wordmark mr-auto md:hidden">folio<span className="text-accent">.</span></span>}
            <h1 ref={headingRef} tabIndex={-1} title={chat.active.title} className={hasMessages ? 'min-w-0 flex-1 truncate text-muted' : 'sr-only focus:not-sr-only'}>{chat.active.title}</h1>
            {hasMessages && hasMoreToRead && <button className="button flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-2 text-muted hover:bg-surface hover:text-ink" onClick={readOn} title="Read the next part of this conversation">Read on<ArrowDown size={17} aria-hidden="true" /></button>}
            <button className="icon-button -mr-2 ml-auto shrink-0 text-muted md:hidden" aria-label="About this demo" onClick={() => demoRef.current?.showModal()}><Info size={20} aria-hidden="true" /></button>
          </header>
          <div ref={scrollRef} className="message-scroll min-h-0 overflow-y-auto" tabIndex={hasMessages ? 0 : -1} role="region" aria-label="Conversation messages" onScroll={event => {
            const element = event.currentTarget;
            const atBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 8;
            follow.current = atBottom;
            readingPositions.current.set(chat.activeId, element.scrollTop);
            measureReading();
          }}>
            <div className="transcript reading-width" data-testid="messages">
              {chat.messages.map((message, index) => message.role === 'user' ? <article key={message.id} className="question" aria-label="Your question">
                <p className="mb-3 text-muted">You</p>
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                {!!message.attachments?.length && <ul className="submitted-files mt-4 grid gap-2" aria-label="Submitted files">{message.attachments.map(file => <FileItem key={file.id} file={file} />)}</ul>}
              </article> : <Answer key={message.id} message={message} steps={index === chat.messages.length - 1 ? chat.tools : []} busy={index === chat.messages.length - 1 && chat.busy} error={index === chat.messages.length - 1 ? chat.error : ''} canRetry={index === chat.messages.length - 1 && chat.canRetry} retry={retry} />)}
            </div>
          </div>
          <div className="composer-dock relative shrink-0">
            <Composer chat={chat} textareaRef={textareaRef} hasMessages={hasMessages} onSend={send} onStop={() => { chat.stop(); textareaRef.current?.focus({ preventScroll: true }); }} />
          </div>
        </main>
        <motion.aside ref={navigationRef} id="mobile-conversations" aria-label="Conversation history" aria-hidden={!navigationOpen} inert={!navigationOpen} initial={false} animate={{ opacity: navigationOpen ? 1 : 0, y: reduced ? 0 : navigationOpen ? 0 : -10 }} transition={reduced ? { duration: 0 } : spring} className={`mobile-navigation fixed z-40 flex flex-col rounded-[20px] border border-rule bg-canvas p-4 md:hidden ${navigationOpen ? '' : 'pointer-events-none'}`}>
          <div className="mb-4 flex items-center justify-between pl-2">
            <h2>Conversations</h2>
            <button className="icon-button" aria-label="Close conversations" onClick={() => closeNavigation()}><X size={20} aria-hidden="true" /></button>
          </div>
          <ConversationList mobile conversations={chat.conversations} activeId={chat.activeId} selectChat={selectConversation} newChat={newConversation} />
        </motion.aside>
      </div>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{status}</p>
      <DemoInfo dialogRef={demoRef} />
    </LayoutGroup>
  </MotionConfig>;
}
