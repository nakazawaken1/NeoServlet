package app;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Properties;
import java.util.Set;
import java.util.logging.ConsoleHandler;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Stream;

/**
 * Config
 * <ol>
 * <li>enum keys</li>
 * <li>default value</li>
 * <li>value type is String, Integer, java8 Stream</li>
 * <li>can get System property</li>
 * </ol>
 */
public enum Config {

    /**
     * log folder
     */
    log_folder("/temp/"),

    /**
     * log filename pattern(DateTimeFormatter format）
     */
    log_filePattern("'ll_'yyyyMMdd'.log'"),

    /**
     * log line pattern
     */
    log_format("%1$tY/%1$tm/%1$td %1$tH:%1$tM:%1$tS.%1$tL %4$s [%2$s] %5$s %6$s%n"),

    /**
     * log level
     */
    log_level("CONFIG"),

    /**
     * class of suppress log
     */
    log_exclude("org.glassfish.jersey.internal.Errors", ","),

    /**
     * database suffix
     */
    db_suffix(""),

    /**
     * datasource generator class
     */
    db_datasource_class,

    /**
     * database auto config(create: drop and create, [update]: create if not exists, reload: delete and insert, none: no operation)
     */
    db_auto("update"),

    /**
     * database connection string
     */
    db_url,

    /**
     * upload folder
     */
    app_upload_folder("/temp/"),

    /**
     * sql folder
     */
    app_sql_folder("/sql/"),

    /**
     * add http response headers
     */
    app_headers(null, "\\s*\\|\\s*"),

    ;
    
    /**
     * system properties
     */
    private static final Properties system = System.getProperties();

    /**
     * application properties
     */
    private static final Properties application = new Properties();

    /**
     * log handler
     */
    private static Handler handler;

    /**
     * default value
     */
    public String defaultValue;

    /**
     * separator
     */
    public String separator;

    /**
     * Constructor
     * 
     * @param defaultValue default value
     * @param separator separator
     */
    private Config(String defaultValue, String separator) {
        this.defaultValue = defaultValue;
        this.separator = separator;
    }

    /**
     * Constructor
     * 
     * @param defaultValue default value
     */
    private Config(String defaultValue) {
        this(defaultValue, ",");
    }

    /**
     * Constructor
     */
    private Config() {
        this(null);
    }

    /**
     * load config
     */
    static {
        try (InputStream in = Thread.currentThread().getContextClassLoader().getResourceAsStream("config.txt");
                InputStreamReader reader = new InputStreamReader(in, StandardCharsets.UTF_8)) {
            application.load(reader);
            startupLog();
            Logger.getGlobal().info(Tool.print(ps -> {
                ps.println("-- listing config --");
                String suffix = db_suffix.get().orElse("");
                for (Config i : Config.values()) {
                    String key = i.name();
                    ps.print(key + '=');
                    if (key.startsWith("db_") && i != db_suffix) {
                        ps.println(get(i + suffix).orElse(i.defaultValue));
                    } else {
                        ps.println(i.text());
                    }
                }
            }));
        } catch (IOException e) {
            Logger.getGlobal().warning(() -> e.toString());
        }
    }

    /**
     * get config value
     * 
     * @param key config key
     * @return config value
     */
    public static Optional<String> get(String key) {
        return Tool.or(system.getProperty(key), () -> application.getProperty(key));
    }

    /**
     * get config value
     * 
     * @return config value
     */
    public Optional<String> get() {
        return get(name());
    }

    /**
     * get text
     * 
     * @return text
     */
    public String text() {
        return get().orElse(defaultValue);
    }

    /**
     * get integer
     * 
     * @return integer
     */
    public int integer() {
        try {
            return Integer.parseInt(text());
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * get stream
     * 
     * @return stream
     */
    public Stream<String> stream() {
        return Stream.of(text().split(separator)).filter(Tool.notEmpty);
    }

    /**
     * log initialize
     */
    public static void startupLog() {
        try {
            log_exclude.stream().forEach(i -> Logger.getLogger(i).setLevel(Level.SEVERE));
            Logger root = Logger.getLogger("");
            Level level = Level.parse(log_level.text().toUpperCase());
            root.setLevel(level);
            boolean noEntry = true;
            for (Handler i : root.getHandlers()) {
                if (i instanceof ConsoleHandler) {
                    if (!(i.getFormatter() instanceof LogFormatter)) {
                        i.setFormatter(new LogFormatter(log_format.text()));
                        i.setLevel(level);
                    }
                }
                if (i instanceof LogHandler) {
                    noEntry = false;
                }
            }
            if (noEntry) {
                if (handler == null) {
                    handler = new LogHandler(log_folder.text(), log_filePattern.text());
                    handler.setLevel(level);
                    handler.setFormatter(new LogFormatter(log_format.text()));
                }
                root.addHandler(handler);
                Logger.getGlobal().info("addHandler: " + handler);
            }
        } catch (Throwable e) {
            Logger.getGlobal().log(Level.WARNING, e.getMessage(), e);
        }
    }

    /**
     * log finalize
     */
    public static void shutdownLog() {
        Logger root = Logger.getLogger("");
        for (Handler i : root.getHandlers()) {
            if (i instanceof LogHandler) {
                Logger.getGlobal().info("removeHandler: " + i);
                i.close();
                root.removeHandler(i);
            }
        }
    }

    /**
     * @return map interface
     */
    public static Map<String, Object> getMap() {
        return new Map<String, Object>() {

            @Override
            public int size() {
                return application.size();
            }

            @Override
            public boolean isEmpty() {
                return application.isEmpty();
            }

            @Override
            public boolean containsKey(Object key) {
                return Config.get((String) key).isPresent();
            }

            @Override
            public boolean containsValue(Object value) {
                throw new AbstractMethodError();
            }

            @Override
            public Object get(Object key) {
                return Config.get((String) key).orElseThrow(() -> new NoSuchElementException((String) key));
            }

            @Override
            public Object put(String key, Object value) {
                throw new AbstractMethodError();
            }

            @Override
            public Object remove(Object key) {
                throw new AbstractMethodError();
            }

            @Override
            public void putAll(Map<? extends String, ? extends Object> m) {
                throw new AbstractMethodError();
            }

            @Override
            public void clear() {
                throw new AbstractMethodError();
            }

            @Override
            public Set<String> keySet() {
                throw new AbstractMethodError();
            }

            @Override
            public Collection<Object> values() {
                throw new AbstractMethodError();
            }

            @Override
            public Set<java.util.Map.Entry<String, Object>> entrySet() {
                throw new AbstractMethodError();
            }

        };
    }
}
