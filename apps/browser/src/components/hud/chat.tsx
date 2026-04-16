import { cva } from 'class-variance-authority';
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { type Snapshot, useSnapshot } from 'valtio';
import { cn } from '@/lib/utils';
import {
  type ChatCommand,
  ChatVisibility,
  chatState,
  executeChatCommand,
  getCommandArguments,
  postChatMessage,
  setChatVisibility,
  zChatMessage,
} from '@/store/chat';

const ChatMessages = () => {
  const { messages, visibility } = useSnapshot(chatState);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current?.scrollHeight,
      left: 0,
      behavior: 'instant',
    });
  }, [messages]);

  return (
    <div
      ref={messagesContainerRef}
      className={cn(
        'w-full outline-none border-none h-full px-2 pb-2 overflow-y-auto overflow-x-hidden gap-1 flex flex-col',
        visibility === ChatVisibility.INACTIVE && 'no-scrollbar',
      )}
    >
      {messages.map((message) => (
        <div
          key={message.timestamp}
          className={'font-semibold text-base w-full break-all'}
        >
          {message.playerId && message.playerNickname && (
            <>
              [{message.playerId}]{message.playerNickname}:{' '}
            </>
          )}
          <span>{message.content}</span>
        </div>
      ))}
    </div>
  );
};

const inputContainerVariants = cva('w-full transition-opacity p-2 relative', {
  variants: {
    visibility: {
      [ChatVisibility.HIDDEN]: 'opacity-0',
      [ChatVisibility.INACTIVE]: 'opacity-0',
      [ChatVisibility.ACTIVE]: 'opacity-100',
    },
  },
});

type CommandSuggestionsProps = {
  suggestions: Snapshot<ChatCommand[]>;
  onSuggestionSelected(
    currentSuggestion: ChatCommand | Snapshot<ChatCommand>,
    currentArgumentIndex: number,
  ): boolean;
  onSuggestionExecuted(
    currentSuggestion: ChatCommand | Snapshot<ChatCommand>,
  ): void;
  input: string;
};

const CommandSuggestions = ({
  suggestions,
  onSuggestionSelected,
  onSuggestionExecuted,
  input,
}: CommandSuggestionsProps) => {
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const selectedSuggestionRef = useRef<HTMLDivElement>(null);

  const currentArgumentIndex = useMemo(
    () => input.split(' ').length - 2,
    [input],
  );

  useEffect(() => {
    selectedSuggestionRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [selectedSuggestionIndex]);

  useEffect(() => {
    if (selectedSuggestionIndex > suggestions.length - 1) {
      setSelectedSuggestionIndex(0);
    }
  }, [selectedSuggestionIndex, suggestions.length]);

  useHotkeys(
    'enter',
    () => {
      const currentSuggestion = suggestions[selectedSuggestionIndex ?? 0];

      if (onSuggestionSelected(currentSuggestion, currentArgumentIndex)) {
        onSuggestionExecuted(currentSuggestion);
      }
    },
    {
      preventDefault: true,
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  useHotkeys(
    'tab',
    () => {
      const currentSuggestion = suggestions[selectedSuggestionIndex];

      onSuggestionSelected(currentSuggestion, currentArgumentIndex);

      // if (inputCommand === currentSuggestion.name && currentSuggestion.args) {
      //   if (currentArgumentIndex < currentSuggestion.args.length - 1) {
      //     setInput((prev) => prev + ' ');
      //   }
      // } else {
      //   setInput(
      //     `/${currentSuggestion.name}${
      //       currentSuggestion.args?.length ? ' ' : ''
      //     }`,
      //   );
      //   setSelectedSuggestionIndex(0);
      // }
    },
    {
      preventDefault: true,
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  useHotkeys(
    'up',
    () => {
      setSelectedSuggestionIndex((prev) => Math.max(0, prev - 1));
    },
    {
      preventDefault: true,
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  useHotkeys(
    'down',
    () => {
      setSelectedSuggestionIndex((prev) =>
        Math.min(suggestions.length - 1, prev + 1),
      );
    },
    {
      preventDefault: true,
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  return (
    <div className="max-h-[20vh] overflow-y-auto overflow-x-hidden bg-black/30 flex flex-col">
      {suggestions.map((suggestion, suggestionIndex) => (
        <div
          ref={
            suggestionIndex === selectedSuggestionIndex
              ? selectedSuggestionRef
              : undefined
          }
          className={`flex flex-col p-4 gap-2 ${suggestionIndex === selectedSuggestionIndex && 'bg-[#efb100]/40'}`}
          key={suggestion.name}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold">{suggestion.name}</span>
            <div className="flex items-center gap-1">
              {getCommandArguments(suggestion).map((arg, argIndex) => (
                <span
                  className={`${argIndex === currentArgumentIndex ? 'bg-[#efb100]/80' : 'bg-black/40'} p-1`}
                  key={arg.title}
                >
                  {arg.title ?? `arg${argIndex}`}: {arg.type}
                </span>
              ))}
            </div>
          </div>
          {suggestion.description && (
            <span className="text-xs">{suggestion.description}</span>
          )}
        </div>
      ))}
    </div>
  );
};

const suggestCommands = (commands: Snapshot<ChatCommand[]>, query: string) => {
  return commands.filter((c) => c.name.startsWith(query));
};

const ChatInput = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const inputHistoryRef = useRef<string[]>([]);
  const inputHistoryIndexRef = useRef<number | null>(null);

  const { visibility, clientCommands, serverCommands } = useSnapshot(chatState);

  const commands = [...serverCommands, ...clientCommands];
  const inputCommand = useMemo(
    () => input.replace('/', '').split(' ')[0],
    [input],
  );
  const commandSuggestions = useMemo(
    () => suggestCommands(commands, inputCommand),
    [commands, inputCommand],
  );
  const isCommand = useMemo(() => input.startsWith('/'), [input]);

  const isActive = visibility === ChatVisibility.ACTIVE;

  useEffect(() => {
    if (isActive) {
      const timeout = setTimeout(() => inputRef.current?.focus(), 1);
      return () => clearTimeout(timeout);
    } else {
      inputRef.current?.blur();
      setInput('');
      inputHistoryIndexRef.current = null;
    }
  }, [isActive]);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    inputHistoryIndexRef.current = null;
  };

  const onSubmit = (e?: any) => {
    e?.preventDefault();
    const inputTrimmed = input.trim();

    if (!inputTrimmed) {
      setInput('');
      inputHistoryIndexRef.current = null;
      setChatVisibility(ChatVisibility.INACTIVE);
      return;
    }

    if (isCommand) {
      const [commandName, ...commandArgs] = input.replace('/', '').split(' ');
      executeChatCommand(commandName, commandArgs);
    } else {
      postChatMessage(inputTrimmed);
    }

    inputHistoryRef.current.push(inputTrimmed);
    inputHistoryIndexRef.current = null;
    setInput('');
    setChatVisibility(ChatVisibility.INACTIVE);

    // setInput('');
    // inputHistoryIndexRef.current = null;
    // setChatVisibility(ChatVisibility.INACTIVE);
  };

  useHotkeys(
    'up',
    (e) => {
      e.preventDefault();
      if (!inputHistoryRef.current.length) {
        return;
      }

      const newIndex =
        inputHistoryIndexRef.current === null
          ? inputHistoryRef.current.length - 1
          : Math.max(0, inputHistoryIndexRef.current - 1);

      inputHistoryIndexRef.current = newIndex;
      setInput(inputHistoryRef.current[newIndex]);
    },
    { enableOnFormTags: true, scopes: 'chat', enabled: isActive },
    [isActive],
  );

  useHotkeys(
    'down',
    (e) => {
      e.preventDefault();
      if (inputHistoryIndexRef.current === null) {
        return;
      }

      const nextIndex = inputHistoryIndexRef.current + 1;
      if (nextIndex >= inputHistoryRef.current.length) {
        inputHistoryIndexRef.current = null;
        setInput('');
      } else {
        inputHistoryIndexRef.current = nextIndex;
        setInput(inputHistoryRef.current[nextIndex]);
      }
    },
    { enableOnFormTags: true, scopes: 'chat', enabled: isActive },
    [isActive],
  );

  const onSuggestionSelected = (
    suggestion: ChatCommand,
    currentArgumentIndex: number,
  ) => {
    const args = getCommandArguments(suggestion);

    if (inputCommand === suggestion.name && suggestion.args) {
      if (currentArgumentIndex < args.length - 1) {
        setInput((prev) => `${prev} `);
        return false;
      }
    } else {
      setInput(`/${suggestion.name}${args.length ? ' ' : ''}`);
    }

    return true;
  };

  const onSuggestionExecuted = (suggestion: ChatCommand) => {
    if (inputCommand === suggestion?.name) {
      onSubmit();
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className={inputContainerVariants({ visibility })}
    >
      <input
        ref={inputRef}
        maxLength={zChatMessage.shape.content.maxLength ?? undefined}
        type="text"
        value={input}
        onChange={onInputChange}
        className="w-full bg-black/40 p-2 h-full outline-none border-none text-foreground text-base font-semibold"
      />
      {isCommand && (
        <CommandSuggestions
          suggestions={commandSuggestions}
          onSuggestionSelected={onSuggestionSelected}
          onSuggestionExecuted={onSuggestionExecuted}
          input={input}
        />
      )}
    </form>
  );
};

const INACTIVE_TIME = 10_000;

const chatContainerVariants = cva(
  'fixed left-0 top-[10vh] outline-none transition-opacity h-[25vh] w-[35vw] max-w-[700px]',
  {
    variants: {
      visibility: {
        [ChatVisibility.HIDDEN]: 'opacity-0',
        [ChatVisibility.INACTIVE]: 'opacity-80',
        [ChatVisibility.ACTIVE]: 'opacity-100',
      },
    },
  },
);

export const Chat = () => {
  const { visibility, messages } = useSnapshot(chatState);

  useEffect(() => {
    if (visibility !== ChatVisibility.INACTIVE) {
      return;
    }

    const t = setTimeout(
      () => setChatVisibility(ChatVisibility.HIDDEN, false),
      INACTIVE_TIME,
    );

    return () => clearTimeout(t);
  }, [visibility, messages]);

  const ref = useHotkeys<HTMLDivElement>(
    'esc',
    () => {
      setChatVisibility(ChatVisibility.INACTIVE);
    },
    { enableOnContentEditable: true, enableOnFormTags: true, scopes: 'chat' },
  );

  useHotkeys(
    't',
    () => {
      setChatVisibility(ChatVisibility.ACTIVE);
    },
    {
      scopes: 'chat',
      enableOnFormTags: false,
      enableOnContentEditable: false,
    },
  );

  return (
    <div
      ref={ref}
      onClick={() => setChatVisibility(ChatVisibility.ACTIVE)}
      onBlur={() => setChatVisibility(ChatVisibility.INACTIVE)}
      className={chatContainerVariants({ visibility })}
    >
      <ChatMessages />
      <ChatInput />
    </div>
  );
};
