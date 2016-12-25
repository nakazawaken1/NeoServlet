package app;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.function.Consumer;
import java.util.function.Predicate;
import java.util.function.Supplier;

public class Tool {
    
    /**
     * not empty string
     */
    public static final Predicate<String> notEmpty = ((Predicate<String>) String::isEmpty).negate();

    /**
     * PrintStream to String
     * @param action write to PrintStream
     * @return wrote text
     */
    public static String print(Consumer<PrintStream> action) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream(); PrintStream ps = new PrintStream(out)) {
            action.accept(ps);
            return out.toString(StandardCharsets.UTF_8.name());
        } catch (IOException e) {
            return "";
        }
    }

    /**
     * get first non-null value
     * @param value value
     * @param suppliers value suppliers
     * @return value
     */
    @SafeVarargs
    public static <T> Optional<T> or(T value, Supplier<T>... suppliers) {
        for (Supplier<T> i : suppliers) {
            if (value != null) {
                break;
            }
            value = i.get();
        }
        return Optional.ofNullable(value);
    }

    /**
     * get non-empty and non-null string
     * 
     * @param value value
     * @return String or empty if null or empty
     */
    public static Optional<String> string(Object value) {
        return value == null ? Optional.empty() : Optional.ofNullable(value.toString()).filter(notEmpty);
    }
}
