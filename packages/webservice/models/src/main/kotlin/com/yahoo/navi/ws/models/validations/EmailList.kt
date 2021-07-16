/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import javax.mail.internet.InternetAddress
import javax.validation.Constraint
import javax.validation.ConstraintValidator
import javax.validation.ConstraintValidatorContext
import kotlin.reflect.KClass

@Target(AnnotationTarget.FIELD)
@Retention(AnnotationRetention.RUNTIME)
@Constraint(validatedBy = [EmailListValidator::class])
annotation class EmailList(
    val message: String = "Invalid email values",
    val groups: Array<KClass<out Any>> = [],
    val payload: Array<KClass<out Any>> = []
)

class EmailListValidator : ConstraintValidator<EmailList, List<String>> {
    override fun isValid(value: List<String>?, context: ConstraintValidatorContext?): Boolean {
        return value?.all { isAnEmail(it) } == true
    }

    private fun isAnEmail(email: String): Boolean {
        var result = true
        try {
            val emailAddr = InternetAddress(email)
            emailAddr.validate()
        } catch (ex: Exception) {
            result = false
        }
        return result
    }
}
