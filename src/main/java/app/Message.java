package app;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.MissingResourceException;
import java.util.Optional;
import java.util.PropertyResourceBundle;
import java.util.ResourceBundle;
import java.util.ResourceBundle.Control;

/**
 * Message
 */
public enum Message {
    /*define message key here*/
    hello;

    /**
     * messages from message.txt
     * <div>The locale setting can be specified in the server startup parameter - app.locale</div>
     */
    private static final ResourceBundle messages = ResourceBundle.getBundle("message",
            Optional.ofNullable(System.getProperty("app.locale")).map(Locale::new).orElse(Locale.getDefault()), Thread.currentThread().getContextClassLoader(),
            new Control() {
                /*
                 * (non-Javadoc)
                 * 
                 * @see java.util.ResourceBundle.Control#newBundle(java.lang.String, java.util.Locale, java.lang.String, java.lang.ClassLoader, boolean)
                 */
                @Override
                public ResourceBundle newBundle(String baseName, Locale locale, String format, ClassLoader loader, boolean reload)
                        throws IllegalAccessException, InstantiationException, IOException {
                    String resourceName = toResourceName(toBundleName(baseName, locale), "txt");

                    try (InputStream in = loader.getResourceAsStream(resourceName);
                            InputStreamReader reader = new InputStreamReader(in, StandardCharsets.UTF_8)) {
                        return new PropertyResourceBundle(reader);
                    }
                }
            });

    /**
     * get message from key
     * 
     * @param key message key
     * @return message or key if missing
     */
    public static String get(String key) {
        try {
            return messages.getString(key);
        } catch (MissingResourceException e) {
            return key;
        }
    }

    /**
     * メッセージを取得
     * 
     * @see java.lang.Enum#toString()
     */
    @Override
    public String toString() {
        return get(name());
    }
}
